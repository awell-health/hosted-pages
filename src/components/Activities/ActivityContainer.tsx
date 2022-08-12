import { FC } from 'react'
import { useSessionActivities } from '../../hooks/useSessionActivities'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { ErrorPage } from '../ErrorPage'
import { ActivityProvider } from '../../hooks/activityNavigation'
import { Activities } from './Activities'
import classes from './activityContainer.module.css'

export const ActivityContainer: FC<{ pathwayId: string }> = ({ pathwayId }) => {
  const { t } = useTranslation()
  const { activities, loading, error } = useSessionActivities({
    onlyStakeholderActivities: true,
  })

  if (loading) {
    return <LoadingPage title={t('activity_loading')} />
  }
  if (error) {
    return <ErrorPage title={t('activity_loading_error')} />
  }

  return (
    <ActivityProvider activities={activities}>
      <div className={classes.awell_activity_container}>
        <Activities activities={activities} />
      </div>
    </ActivityProvider>
  )
}
