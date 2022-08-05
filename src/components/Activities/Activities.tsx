import { FC } from 'react'
import { usePathwayActivities } from '../../hooks/usePathwayActivities'
import { ActivityDetails } from './ActivityDetails'

export const Activities: FC<{ pathwayId: string }> = ({ pathwayId }) => {
  const { activities } = usePathwayActivities({ pathwayId })

  // TODO secure showing no more that one activity at the time
  return (
    <>
      {activities
        .filter((activity) => activity.isUserActivity)
        .map((activity) => (
          <ActivityDetails activity={activity} key={activity.id} />
        ))}
    </>
  )
}
