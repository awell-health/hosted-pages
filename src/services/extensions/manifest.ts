import React from 'react'
import ReactDOM from 'react-dom'

export type ComponentId = string

export type ComponentSpec = {
  id: ComponentId
  expose: string
}

export type ComponentsManifest = {
  remoteName: string
  remoteEntryUrl: string
  version: string
  components: ComponentSpec[]
}

export type ActionComponent<Props extends object = Record<string, unknown>> = (
  props: Props
) => unknown

type MinimalFederationInstance = {
  loadRemote: (id: string) => Promise<unknown>
}

const instanceCache = new Map<string, MinimalFederationInstance>()

async function ensureRuntimeInitialized(
  manifest: ComponentsManifest
): Promise<MinimalFederationInstance> {
  const key = `${manifest.remoteName}|${manifest.remoteEntryUrl}`
  const cached = instanceCache.get(key)
  if (cached) return cached

  // Lazy import so build won't fail if the package isn't installed yet
  const runtime: any = await import('@module-federation/runtime').catch(
    () => null
  )
  if (!runtime?.createInstance) {
    throw new Error('Module federation runtime not available')
  }

  const mfInstance = runtime.createInstance({
    name: 'hostedPages',
    remotes: [
      {
        name: manifest.remoteName,
        entry: manifest.remoteEntryUrl,
      },
    ],
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
    },
  })
  instanceCache.set(key, mfInstance as unknown as MinimalFederationInstance)
  return mfInstance as unknown as MinimalFederationInstance
}

export async function loadActionComponent(
  manifest: ComponentsManifest,
  componentId: ComponentId
): Promise<ActionComponent> {
  const spec = manifest.components.find((c) => c.id === componentId)
  if (!spec) throw new Error(`Unknown component: ${componentId}`)

  const mf = await ensureRuntimeInitialized(manifest)
  const exposePath = spec.expose.startsWith('./')
    ? spec.expose.slice(2)
    : spec.expose.replace(/^\.\//, '')
  const mod = (await mf.loadRemote(`${manifest.remoteName}/${exposePath}`)) as {
    default: ActionComponent
  }
  return mod.default as ActionComponent
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
  try {
    const absolute = new URL(manifest.remoteEntryUrl, base).href
    return { ...manifest, remoteEntryUrl: absolute }
  } catch {
    return manifest
  }
}
