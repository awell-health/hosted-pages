import { FC } from 'react'
import { Activity } from './types'
import { ActivityDetails } from './ActivityDetails'
import { useCurrentActivity } from '../../hooks/activityNavigation'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'

export const Activities: FC<{ activities: Array<Activity> }> = ({
  activities,
}) => {
  const { currentActivity } = useCurrentActivity()
  const { t } = useTranslation()
  if (activities.length === 0) {
    return <LoadingPage title={t('waiting_for_new_activities')} />
  }
  return (
    <>
      <ActivityDetails
        activity={activities[currentActivity]}
        key={activities[currentActivity]?.id}
      />
    </>
  )
}
