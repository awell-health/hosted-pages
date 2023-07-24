/* eslint-disable react-hooks/exhaustive-deps */
import { isNil } from 'lodash'
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
  const [currentActivityId, setCurrentActivityId] = useState<string>('')

  const findCurrentActivity = (): Activity | undefined => {
    if (activities.length === 0 || isNil(currentActivityId)) {
      return undefined
    }
    return activities.find(({ id }) => id === currentActivityId)
  }

  const findNextActiveActivity = (): Activity | undefined => {
    return activities.find(
      ({ status, id }) =>
        status === ActivityStatus.Active && id !== currentActivityId
    )
  }

  const handleSetCurrent = () => {
    const currentActivity = findCurrentActivity()

    if (isNil(currentActivity)) {
      return
    }

    // if current activity is still active, then do not move
    // to the next activity unless it is marked as completed
    if (currentActivity.status === ActivityStatus.Active) {
      return
    }

    const nextActivity = findNextActiveActivity()
    if (!isNil(nextActivity)) {
      setCurrentActivityId(nextActivity.id)
    }
  }

  useEffect(() => {
    handleSetCurrent()
  }, [activities])

  return (
    <ActivityContext.Provider
      value={{
        currentActivityId,
        handleNavigateToNextActivity: handleSetCurrent,
      }}
    >
      {children}
    </ActivityContext.Provider>
  )
}
