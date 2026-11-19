import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { ComponentsManifest } from './manifest'

const BASE = 'https://extensions.development.awellhealth.com'

const v1Manifest: ComponentsManifest = {
  remoteName: 'awellExtensionComponents',
  remoteEntryUrl: '/v2/components/remoteEntry.js',
  version: '1.15.32',
  components: [
    {
      id: 'hello-world.frontend',
      expose: './components/hello-world/frontend',
    },
    { id: 'brave.uploadFile', expose: './components/brave/uploadFile' },
    {
      id: 'brave.dynamicChoiceSelector',
      expose: './components/brave/dynamicChoiceSelector',
    },
  ],
}

const v2Manifest: ComponentsManifest = {
  ...v1Manifest,
  remotes: [
    {
      extension: 'hello-world',
      remoteName: 'awellExt_hello_world',
      remoteEntryUrl: '/v2/components/hello-world/remoteEntry.js',
      version: '2.1.212',
      components: [{ id: 'hello-world.frontend', expose: './frontend' }],
    },
    {
      extension: 'brave',
      remoteName: 'awellExt_brave',
      remoteEntryUrl: '/v2/components/brave/remoteEntry.js',
      version: '0.0.125',
      components: [
        { id: 'brave.uploadFile', expose: './uploadFile' },
        {
          id: 'brave.dynamicChoiceSelector',
          expose: './dynamicChoiceSelector',
        },
      ],
    },
  ],
}

const runtime = vi.hoisted(() => ({
  createInstance: vi.fn(),
  registerRemotes: vi.fn(),
  loadRemote: vi.fn(),
}))

vi.mock('@module-federation/runtime', () => ({
  createInstance: runtime.createInstance,
}))

// The module keeps one federation instance per page; reload it per test.
const loadModule = async () => {
  vi.resetModules()
  return await import('./manifest')
}

beforeEach(() => {
  runtime.registerRemotes.mockReset()
  runtime.loadRemote.mockReset()
  runtime.loadRemote.mockImplementation(async (id: string) => ({
    default: { loaded: id },
  }))
  runtime.createInstance.mockReset()
  runtime.createInstance.mockImplementation(() => ({
    registerRemotes: runtime.registerRemotes,
    loadRemote: runtime.loadRemote,
  }))
})

describe('resolveComponent', () => {
  it('resolves a component to its per-extension remote (v2)', async () => {
    const { resolveComponent } = await loadModule()
    expect(resolveComponent(v2Manifest, 'brave.uploadFile')).toEqual({
      remoteName: 'awellExt_brave',
      remoteEntryUrl: '/v2/components/brave/remoteEntry.js',
      expose: './uploadFile',
    })
  })

  it('falls back to the legacy combined remote without remotes (v1)', async () => {
    const { resolveComponent } = await loadModule()
    expect(resolveComponent(v1Manifest, 'brave.uploadFile')).toEqual({
      remoteName: 'awellExtensionComponents',
      remoteEntryUrl: '/v2/components/remoteEntry.js',
      expose: './components/brave/uploadFile',
    })
  })

  it('falls back to v1 when no remote provides the component', async () => {
    const { resolveComponent } = await loadModule()
    const manifest: ComponentsManifest = {
      ...v1Manifest,
      remotes: v2Manifest.remotes?.filter((r) => r.extension !== 'brave'),
    }
    expect(resolveComponent(manifest, 'brave.uploadFile')?.remoteName).toBe(
      'awellExtensionComponents'
    )
  })

  it('returns null for an unknown component', async () => {
    const { resolveComponent } = await loadModule()
    expect(resolveComponent(v2Manifest, 'nope.nothing')).toBeNull()
  })
})

describe('absolutizeManifestUrls', () => {
  it('resolves the v1 and every v2 remoteEntryUrl against the base', async () => {
    const { absolutizeManifestUrls } = await loadModule()
    const manifest = absolutizeManifestUrls(v2Manifest, BASE)
    expect(manifest.remoteEntryUrl).toBe(`${BASE}/v2/components/remoteEntry.js`)
    expect(manifest.remotes?.map((r) => r.remoteEntryUrl)).toEqual([
      `${BASE}/v2/components/hello-world/remoteEntry.js`,
      `${BASE}/v2/components/brave/remoteEntry.js`,
    ])
  })

  it('leaves a v1 manifest without remotes', async () => {
    const { absolutizeManifestUrls } = await loadModule()
    const manifest = absolutizeManifestUrls(v1Manifest, BASE)
    expect(manifest).not.toHaveProperty('remotes')
  })
})

describe('loadActionComponent', () => {
  it('loads each component from its own remote, registering each remote once', async () => {
    const { loadActionComponent } = await loadModule()

    await expect(
      loadActionComponent(v2Manifest, 'brave.uploadFile')
    ).resolves.toEqual({ loaded: 'awellExt_brave/uploadFile' })
    await expect(
      loadActionComponent(v2Manifest, 'brave.dynamicChoiceSelector')
    ).resolves.toEqual({ loaded: 'awellExt_brave/dynamicChoiceSelector' })
    await expect(
      loadActionComponent(v2Manifest, 'hello-world.frontend')
    ).resolves.toEqual({ loaded: 'awellExt_hello_world/frontend' })

    expect(runtime.createInstance).toHaveBeenCalledTimes(1)
    expect(runtime.registerRemotes.mock.calls).toEqual([
      [
        [
          {
            name: 'awellExt_brave',
            entry: '/v2/components/brave/remoteEntry.js',
          },
        ],
        { force: false },
      ],
      [
        [
          {
            name: 'awellExt_hello_world',
            entry: '/v2/components/hello-world/remoteEntry.js',
          },
        ],
        { force: false },
      ],
    ])
  })

  it('loads from the legacy combined remote with a v1 manifest', async () => {
    const { loadActionComponent } = await loadModule()

    await expect(
      loadActionComponent(v1Manifest, 'brave.uploadFile')
    ).resolves.toEqual({
      loaded: 'awellExtensionComponents/components/brave/uploadFile',
    })
    expect(runtime.registerRemotes).toHaveBeenCalledWith(
      [
        {
          name: 'awellExtensionComponents',
          entry: '/v2/components/remoteEntry.js',
        },
      ],
      { force: false }
    )
  })

  it('re-registers a remote whose entry URL changed', async () => {
    const { loadActionComponent } = await loadModule()
    await loadActionComponent(v2Manifest, 'brave.uploadFile')
    const moved: ComponentsManifest = {
      ...v2Manifest,
      remotes: v2Manifest.remotes?.map((r) => ({
        ...r,
        remoteEntryUrl: `https://elsewhere.test${r.remoteEntryUrl}`,
      })),
    }
    await loadActionComponent(moved, 'brave.uploadFile')
    expect(runtime.registerRemotes).toHaveBeenLastCalledWith(
      [
        {
          name: 'awellExt_brave',
          entry: 'https://elsewhere.test/v2/components/brave/remoteEntry.js',
        },
      ],
      { force: true }
    )
  })

  it('rejects an unknown component without touching the runtime', async () => {
    const { loadActionComponent } = await loadModule()
    await expect(
      loadActionComponent(v2Manifest, 'nope.nothing')
    ).rejects.toThrow('Unknown component: nope.nothing')
    expect(runtime.createInstance).not.toHaveBeenCalled()
  })

  it('rejects when the remote module has no default export', async () => {
    const { loadActionComponent } = await loadModule()
    runtime.loadRemote.mockResolvedValueOnce(null)
    await expect(
      loadActionComponent(v2Manifest, 'brave.uploadFile')
    ).rejects.toThrow('has no default export')
  })
})
