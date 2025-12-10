'use client'

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { LoadingPage } from '../LoadingPage'
import type { ExtensionActivityRecord } from './types'
import {
  fetchComponentsManifest,
  loadActionComponent,
  type ActionComponent,
} from '../../services/extensions/manifest'
import { useCompleteExtensionActivity } from '../../hooks/useCompleteExtensionActivity'

type RemoteExtensionLoaderProps = {
  componentId?: string | null
  activityDetails: ExtensionActivityRecord
  fallback: React.ReactNode
}

type ComponentProps = {
  activityDetails: ExtensionActivityRecord
  onSubmit: (dataPoints: Record<string, unknown>) => void
}

type LoadStatus = 'loading' | 'available' | 'not_in_manifest' | 'load_error'

export const RemoteExtensionLoader: FC<RemoteExtensionLoaderProps> = ({
  componentId,
  activityDetails,
  fallback,
}) => {
  const [Component, setComponent] =
    useState<React.ComponentType<ComponentProps> | null>(null)
  const [status, setStatus] = useState<LoadStatus>('loading')

  const { onSubmit } = useCompleteExtensionActivity()

  const handleSubmit = useCallback(
    (dataPoints: Record<string, unknown>) => {
      console.log(
        `Submitting data points to activity ${activityDetails.activity_id}`,
        {
          dataPoints,
          activityId: activityDetails.activity_id,
          componentKey: componentId,
        }
      )
      void onSubmit(
        activityDetails.activity_id,
        Object.entries(dataPoints).map(([key, value]) => ({
          key,
          value: String(value),
        }))
      )
    },
    [onSubmit, activityDetails.activity_id, componentId]
  )

  const normalizedId = useMemo(() => {
    if (!componentId) return null
    return componentId.trim()
  }, [componentId])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setStatus('loading')
      setComponent(null)

      if (!normalizedId) {
        setStatus('not_in_manifest')
        return
      }

      try {
        const manifest = await fetchComponentsManifest()
        if (cancelled) return

        // Check if component exists in manifest before trying to load
        const isInManifest = manifest.components.some(
          (c) => c.id === normalizedId
        )
        if (!isInManifest) {
          setStatus('not_in_manifest')
          return
        }

        const Comp = (await loadActionComponent(
          manifest,
          normalizedId
        )) as ActionComponent<ComponentProps>
        if (cancelled) return

        setComponent(() => Comp as unknown as FC<ComponentProps>)
        setStatus('available')
      } catch {
        if (cancelled) return
        setStatus('load_error')
      }
    }

    void load()
    return () => {
      cancelled = true
    }
  }, [normalizedId])

  if (status === 'loading') {
    return <LoadingPage />
  }

  // If not in manifest or failed to load, use fallback
  if (status === 'not_in_manifest' || status === 'load_error' || !Component) {
    return <>{fallback}</>
  }

  return <Component activityDetails={activityDetails} onSubmit={handleSubmit} />
}
