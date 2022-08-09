import { FC } from 'react'
import { Activity } from './types'
import { ActivityDetails } from './ActivityDetails'
import { useCurrentActivity } from '../../hooks/activityNavigation'

export const Activities: FC<{ activities: Array<Activity> }> = ({
  activities,
}) => {
  const { currentActivity } = useCurrentActivity()
  return (
    <ActivityDetails
      activity={activities[currentActivity]}
      key={activities[currentActivity].id}
    />
  )
}
