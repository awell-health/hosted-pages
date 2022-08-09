import React, { FC, useState } from 'react'
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
    if (activities.length - 1 <= currentActivity) {
      return
    }
    setCurrentActivity(currentActivity + 1)
  }

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
