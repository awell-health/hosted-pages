import { FC } from 'react'
import { Activity } from './types'
import { ActivityDetails } from './ActivityDetails'
import { useCurrentActivity } from '../../hooks/activityNavigation'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { ActivityStatus } from '../../hooks/useForm'
import { isNil } from 'lodash'

export const Activities: FC<{ activities: Array<Activity> }> = ({
  activities,
}) => {
  const { currentActivityId } = useCurrentActivity()
  const { t } = useTranslation()

  const pendingActivities = activities.filter(
    (activity) => activity.status === ActivityStatus.Active
  )

  const currentActivity = activities.find(({ id }) => id === currentActivityId)

  if (isNil(currentActivity) || pendingActivities.length === 0) {
    return <LoadingPage title={t('activities.waiting_for_new_activities')} />
  }

  return (
    <>
      <ActivityDetails activity={currentActivity} key={currentActivityId} />
    </>
  )
}
