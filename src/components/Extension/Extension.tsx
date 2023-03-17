import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../ErrorPage'
import { CalDotComExtension } from './CalDotComExtension'
import { useExtensionActivity } from '../../hooks/useExtensionActivity'
import { LoadingPage } from '../LoadingPage'

import { type Activity, ExtensionKey } from './types'

interface ExtensionProps {
  activity: Activity
}

export const Extension: FC<ExtensionProps> = ({ activity }) => {
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
    case ExtensionKey.CAL_DOT_COM:
      return (
        <CalDotComExtension
          activity={activity}
          activityDetails={extensionActivityDetails}
        />
      )
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

Extension.displayName = 'Extension'