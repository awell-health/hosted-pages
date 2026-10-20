import React from 'react'
import ReactDOM from 'react-dom'
import * as ReactJsxRuntime from 'react/jsx-runtime'

export type ComponentId = string

export type ComponentSpec = {
  id: ComponentId
  expose: string
}

/**
 * One Module Federation remote per extension (manifest v2). `expose` of its
 * components is relative to this remote, e.g. `./uploadFile`.
 */
export type RemoteSpec = {
  extension: string
  remoteName: string
  remoteEntryUrl: string
  version: string
  components: ComponentSpec[]
}

/**
 * `GET /v2/components/manifest` of the extension server.
 *
 * The top-level fields (v1) describe the legacy combined remote
 * `awellExtensionComponents`. `remotes` (v2) lists one remote per extension
 * and is absent on servers that predate it.
 */
export type ComponentsManifest = {
  remoteName: string
  remoteEntryUrl: string
  version: string
  components: ComponentSpec[]
  remotes?: RemoteSpec[]
}

export type ActionComponent<Props extends object = Record<string, unknown>> = (
  props: Props
) => unknown

/** Where a component lives: which remote to load and which module to get. */
export type ResolvedComponent = {
  remoteName: string
  remoteEntryUrl: string
  expose: string
}

/**
 * Resolve a component id to its remote. Prefers the per-extension remotes
 * (v2) and falls back to the legacy combined remote (v1) when the manifest has
 * no `remotes`, or none of them provides the component.
 */
export function resolveComponent(
  manifest: ComponentsManifest,
  componentId: ComponentId
): ResolvedComponent | null {
  const remotes = Array.isArray(manifest.remotes) ? manifest.remotes : []
  for (const remote of remotes) {
    const spec = remote.components?.find((c) => c.id === componentId)
    if (spec) {
      return {
        remoteName: remote.remoteName,
        remoteEntryUrl: remote.remoteEntryUrl,
        expose: spec.expose,
      }
    }
  }
  const legacy = manifest.components?.find((c) => c.id === componentId)
  if (legacy) {
    return {
      remoteName: manifest.remoteName,
      remoteEntryUrl: manifest.remoteEntryUrl,
      expose: legacy.expose,
    }
  }
  return null
}

type FederationRemote = { name: string; entry: string }

type MinimalFederationInstance = {
  loadRemote: (id: string) => Promise<unknown>
  registerRemotes: (
    remotes: FederationRemote[],
    options?: { force?: boolean }
  ) => void
}

let instancePromise: Promise<MinimalFederationInstance> | null = null
// remoteName -> entry URL registered on the instance
const registeredRemotes = new Map<string, string>()

async function createFederationInstance(): Promise<MinimalFederationInstance> {
  // Lazy import so build won't fail if the package isn't installed yet
  const runtime: any = await import('@module-federation/runtime').catch(
    () => null
  )
  if (!runtime?.createInstance) {
    throw new Error('Module federation runtime not available')
  }

  return runtime.createInstance({
    name: 'hostedPages',
    remotes: [],
    shared: {
      react: {
        version: (React as unknown as { version?: string }).version || '18.2.0',
        lib: () => React,
        strategy: 'loaded-first',
        shareConfig: { singleton: true, requiredVersion: false },
      },
      'react-dom': {
        version:
          (ReactDOM as unknown as { version?: string }).version || '18.2.0',
        lib: () => ReactDOM,
        strategy: 'loaded-first',
        shareConfig: { singleton: true, requiredVersion: false },
      },
      // Remotes compiled with the automatic JSX transform must create elements
      // with this page's React, or React cannot render them.
      'react/jsx-runtime': {
        version: (React as unknown as { version?: string }).version || '18.2.0',
        lib: () => ReactJsxRuntime,
        strategy: 'loaded-first',
        shareConfig: { singleton: true, requiredVersion: false },
      },
    },
  }) as MinimalFederationInstance
}

/**
 * One federation instance for the page; each remote is registered the first
 * time one of its components is needed, so every remoteEntry loads once.
 */
async function ensureRemoteRegistered(
  remote: Pick<ResolvedComponent, 'remoteName' | 'remoteEntryUrl'>
): Promise<MinimalFederationInstance> {
  if (!instancePromise) {
    instancePromise = createFederationInstance().catch((e) => {
      instancePromise = null
      throw e
    })
  }
  const mf = await instancePromise
  const registeredEntry = registeredRemotes.get(remote.remoteName)
  if (registeredEntry !== remote.remoteEntryUrl) {
    mf.registerRemotes(
      [{ name: remote.remoteName, entry: remote.remoteEntryUrl }],
      // Only replaces a remote whose entry URL changed (e.g. new manifest)
      { force: registeredEntry !== undefined }
    )
    registeredRemotes.set(remote.remoteName, remote.remoteEntryUrl)
  }
  return mf
}

export async function loadActionComponent(
  manifest: ComponentsManifest,
  componentId: ComponentId
): Promise<ActionComponent> {
  const resolved = resolveComponent(manifest, componentId)
  if (!resolved) throw new Error(`Unknown component: ${componentId}`)

  const mf = await ensureRemoteRegistered(resolved)
  const exposePath = resolved.expose.replace(/^\.\//, '')
  const mod = (await mf.loadRemote(`${resolved.remoteName}/${exposePath}`)) as {
    default: ActionComponent
  } | null
  if (!mod?.default) {
    throw new Error(`Component ${componentId} has no default export`)
  }
  return mod.default as ActionComponent
}

/** Resolve every remoteEntryUrl in the manifest against the server's base URL. */
export function absolutizeManifestUrls(
  manifest: ComponentsManifest,
  base: string
): ComponentsManifest {
  const absolute = (url: string): string => {
    try {
      return new URL(url, base).href
    } catch {
      return url
    }
  }
  return {
    ...manifest,
    remoteEntryUrl: absolute(manifest.remoteEntryUrl),
    ...(Array.isArray(manifest.remotes)
      ? {
          remotes: manifest.remotes.map((remote) => ({
            ...remote,
            remoteEntryUrl: absolute(remote.remoteEntryUrl),
          })),
        }
      : {}),
  }
}

function mapOrchestrationUrlToExtensionBase(orchestrationUrl?: string): string {
  if (!orchestrationUrl) {
    return 'https://extensions.development.awellhealth.com'
  }
  try {
    const host = new URL(orchestrationUrl).host
    if (host.includes('localhost') || host.includes('127.0.0.1')) {
      return 'http://extensions.development.awellhealth.com'
    }
    if (host.includes('development')) {
      return 'https://extensions.development.awellhealth.com'
    }
    if (host.includes('staging')) {
      return 'https://extensions.staging.awellhealth.com'
    }
    if (host.includes('.us.')) {
      return 'https://extensions.us.awellhealth.com'
    }
    if (host.includes('.uk.')) {
      return 'https://extensions.uk.awellhealth.com'
    }
    if (host.includes('sandbox')) {
      return 'https://extensions.sandbox.awellhealth.com'
    }
    return 'https://extensions.awellhealth.com'
  } catch {
    return 'https://extensions.development.awellhealth.com'
  }
}

export async function fetchComponentsManifest(): Promise<ComponentsManifest> {
  const base = mapOrchestrationUrlToExtensionBase(
    process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API
  )
  const res = await fetch(`${base}/v2/components/manifest`, {
    cache: 'no-store',
  })
  if (!res.ok) {
    throw new Error(`Failed to fetch components manifest: ${res.status}`)
  }
  const manifest = (await res.json()) as ComponentsManifest
  return absolutizeManifestUrls(manifest, base)
}
