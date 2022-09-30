import { FC } from 'react'
import { useSessionActivities } from '../../hooks/useSessionActivities'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { ErrorPage } from '../ErrorPage'
import { ActivityProvider } from '../../hooks/activityNavigation'
import { Activities } from './Activities'
import { ErrorBoundary } from '../ErrorBoundary'
import classes from './activityContainer.module.css'

export const ActivityContainer: FC<{ pathwayId: string }> = ({ pathwayId }) => {
  const { t } = useTranslation()
  const { activities, loading, error } = useSessionActivities({
    onlyStakeholderActivities: true,
  })

  if (loading) {
    return <LoadingPage title={t('activities.loading')} />
  }
  if (error) {
    return <ErrorPage title={t('activities.loading_error')} />
  }

  return (
    <ErrorBoundary pathwayId={pathwayId}>
      <div className={classes.awell_activity_container}>
        <ActivityProvider activities={activities}>
          <Activities activities={activities} />
        </ActivityProvider>
      </div>
    </ErrorBoundary>
  )
}
