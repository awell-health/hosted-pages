import React from 'react'
import { useSessionActivities } from '../../hooks/useSessionActivities'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { ErrorPage } from '../ErrorPage'
import { ActivityProvider } from '../../hooks/activityNavigation'
import { Activities } from './Activities'

export const ActivityContainer = () => {
  const { t } = useTranslation()
  const { activities, loading, error, refetch } = useSessionActivities({
    onlyStakeholderActivities: true,
  })

  if (loading) {
    return <LoadingPage title={t('activities.loading')} />
  }

  if (error) {
    return <ErrorPage title={t('activities.loading_error')} onRetry={refetch} />
  }

  return (
    <ActivityProvider activities={activities}>
      <Activities />
    </ActivityProvider>
  )
}
