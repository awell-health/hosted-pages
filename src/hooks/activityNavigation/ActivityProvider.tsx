/* eslint-disable react-hooks/exhaustive-deps */
import { isNil, isEmpty } from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { ActivityStatus } from '../useForm'
import { ActivityContext } from './ActivityContext'
import { Activity } from './types'

interface ActivityProviderProps {
  children?: React.ReactNode
  activities: Array<Activity>
}
/**
 * Provider to store ID of the current activity being shown to user
 * and to determine the next activity from the activities list.
 */
export const ActivityProvider: FC<ActivityProviderProps> = ({
  children,
  activities,
}) => {
  const [currentActivity, setCurrentActivity] = useState<Activity>()

  const findNextActiveActivity = (): Activity | undefined => {
    return activities.find(
      ({ status, id }) =>
        status === ActivityStatus.Active && id !== currentActivity?.id
    )
  }
  const findCurrentActivity = (): Activity | undefined => {
    if (isEmpty(activities) || isNil(currentActivity)) {
      return undefined
    }
    return activities.find(({ id }) => id === currentActivity.id)
  }

  const handleSetCurrent = () => {
    // refetching current activity because it might have changed in the activities list via useEffect
    const current = findCurrentActivity()
    // if current activity is still active, then do not move
    // to the next activity unless it is marked as completed
    if (current?.status === ActivityStatus.Active) {
      return
    }

    const nextActivity = findNextActiveActivity()
    if (!isNil(nextActivity)) {
      setCurrentActivity(nextActivity)
    }
  }

  useEffect(() => {
    handleSetCurrent()
  }, [activities])

  const pendingActivities = activities.filter(
    (activity) => activity.status === ActivityStatus.Active
  )

  const waitingForNewActivities =
    isNil(currentActivity) || pendingActivities.length === 0

  return (
    <ActivityContext.Provider
      value={{
        currentActivity,
        waitingForNewActivities,
        handleNavigateToNextActivity: handleSetCurrent,
      }}
    >
      {children}
    </ActivityContext.Provider>
  )
}
