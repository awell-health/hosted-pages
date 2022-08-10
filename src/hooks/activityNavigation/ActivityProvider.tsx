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

export const ActivityProvider: FC<ActivityProviderProps> = ({
  children,
  activities,
}) => {
  const [currentActivity, setCurrentActivity] = useState(0)

  const handleSetCurrent = () => {
    if (
      activities.length === 0 ||
      activities[currentActivity].status === ActivityStatus.Active
    ) {
      return
    }
    const currentActivityId = activities[currentActivity]?.id

    const nextActivityIndex = activities.findIndex(
      (activity) =>
        activity.status === ActivityStatus.Active &&
        activity.id !== currentActivityId
    )

    if (isNil(nextActivityIndex) || nextActivityIndex < 0) {
      return
    }

    setCurrentActivity(nextActivityIndex)
  }

  useEffect(() => {
    handleSetCurrent()
  }, [activities])

  return (
    <ActivityContext.Provider
      value={{
        currentActivity,
        handleNavigateToNextActivity: handleSetCurrent,
      }}
    >
      {children}
    </ActivityContext.Provider>
  )
}
