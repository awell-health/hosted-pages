/* eslint-disable react-hooks/exhaustive-deps */
import { isNil } from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { Activity, ActivityStatus } from '../types'
import { useSessionActivities } from '../../../hooks/useSessionActivities'
import { useTranslation } from 'next-i18next'
import { ErrorPage, LoadingPage } from '../../'
import { ActivityContext } from './ActivityContext'

interface ActivityProviderProps {
  children?: React.ReactNode
}
/**
 * Provider to store of the current activity being shown to user
 * and to determine the next activity from the activities list.
 */
export const ActivityProvider: FC<ActivityProviderProps> = ({ children }) => {
  const { t } = useTranslation()
  const [currentActivity, setCurrentActivity] = useState<Activity>()
  const { activities, loading, error, refetch } = useSessionActivities()

  const hasPendingActivities = () => {
    const pendingActivities = activities.filter(
      ({ status }) => status === ActivityStatus.Active
    )
    return pendingActivities.length > 0
  }

  const handleSetCurrent = () => {
    if (isNil(currentActivity) && hasPendingActivities()) {
      const firstActive = activities.find(
        ({ status }) => status === ActivityStatus.Active
      )
      if (!isNil(firstActive)) {
        setCurrentActivity(firstActive)
      }
    }
  }

  const unsetCurrentActivity = () => {
    setCurrentActivity(undefined)
  }

  useEffect(() => {
    handleSetCurrent()
  }, [activities])

  useEffect(() => {
    handleSetCurrent()
  }, [currentActivity])

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return <ErrorPage title={t('activities.loading_error')} onRetry={refetch} />
  }

  const waitingForNewActivities =
    isNil(currentActivity) || !hasPendingActivities()

  return (
    <ActivityContext.Provider
      value={{
        currentActivity,
        unsetCurrentActivity,
        waitingForNewActivities,
      }}
    >
      {children}
    </ActivityContext.Provider>
  )
}
