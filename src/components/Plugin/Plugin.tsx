import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../ErrorPage'
import { CalDotComPlugin } from './CalDotComPlugin'
import { useExtensionActivity } from '../../hooks/useExtensionActivity'
import { LoadingPage } from '../LoadingPage'

import type { Activity } from '../../types/generated/types-orchestration'
import { PluginKey } from './types'

interface PluginProps {
  activity: Activity
}

export const Plugin: FC<PluginProps> = ({ activity }) => {
  const { t } = useTranslation()
  const { loading, extensionActivityDetails, error, refetch } =
    useExtensionActivity(activity.object.id)

  if (loading) {
    return <LoadingPage title={t('activities.checklist.loading')} />
  }

  if (error || !extensionActivityDetails) {
    return (
      <ErrorPage
        title={t('activities.checklist.loading_error', { error })}
        onRetry={refetch}
      />
    )
  }

  switch (activity?.indirect_object?.id) {
    case PluginKey.CAL_DOT_COM:
      return (
        <CalDotComPlugin
          activity={activity}
          activityDetails={extensionActivityDetails}
        />
      )
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

Plugin.displayName = 'Plugin'
