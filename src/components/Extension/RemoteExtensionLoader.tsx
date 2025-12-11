'use client'

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { LoadingPage } from '../LoadingPage'
import { ErrorPage } from '../ErrorPage'
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
}

type ComponentProps = {
  activityDetails: ExtensionActivityRecord
  onSubmit: (dataPoints: Record<string, unknown>) => void
}

export const RemoteExtensionLoader: FC<RemoteExtensionLoaderProps> = ({
  componentId,
  activityDetails,
}) => {
  const { t } = useTranslation()
  const [Component, setComponent] =
    useState<React.ComponentType<ComponentProps> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

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
      setLoading(true)
      setError(null)
      try {
        const manifest = await fetchComponentsManifest()
        if (cancelled) return
        if (!normalizedId) {
          throw new Error('Missing extension component id')
        }
        const Comp = (await loadActionComponent(
          manifest,
          normalizedId
        )) as ActionComponent<ComponentProps>
        if (cancelled) return
        setComponent(() => Comp as unknown as FC<ComponentProps>)
      } catch (e) {
        const message =
          e instanceof Error ? e.message : 'Failed to load extension component'
        setError(message)
      } finally {
        setLoading(false)
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [normalizedId])

  if (loading) {
    return <LoadingPage />
  }
  if (error || !Component) {
    return <ErrorPage title={t('activities.activity_not_supported')} />
  }

  return <Component activityDetails={activityDetails} onSubmit={handleSubmit} />
}
