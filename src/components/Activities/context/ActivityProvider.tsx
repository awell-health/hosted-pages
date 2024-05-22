/* eslint-disable react-hooks/exhaustive-deps */
import { isNil } from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { Activity, ActivityStatus } from '../types'
import { useSessionActivities } from '../../../hooks/useSessionActivities'
import { useTranslation } from 'next-i18next'
import { ErrorPage, LoadingPage } from '../../'
import { ActivityContext } from './ActivityContext'
import { useLogging } from '../../../hooks/useLogging'

const POLLING_DELAY = 5000 // 5 seconds

interface ActivityProviderProps {
  children?: React.ReactNode
}

const isActive = (activity: Activity | undefined) =>
  activity?.status === ActivityStatus.Active
/**
 * Provider to store of the current activity being shown to user
 * and to determine the next activity from the activities list.
 */
export const ActivityProvider: FC<ActivityProviderProps> = ({ children }) => {
  const { t } = useTranslation()
  const [currentActivity, setCurrentActivity] = useState<Activity>()
  const { activities, loading, error, refetch, startPolling, stopPolling } =
    useSessionActivities()
  const { infoLog, errorLog } = useLogging()

  // activities list changes as we get new activities from the server or as we complete activities
  // this useEffect drives whole AHP logic, only by activities being changed in apollo cache
  // and base on their status do we determine what to show to the user
  useEffect(() => {
    if (!loading) {
      // get current from the list, it may be updated
      const current = activities.find(({ id }) => id === currentActivity?.id)
      // try and change current activity if it's not active
      if (!isActive(current)) {
        const firstActive = activities.find(isActive)
        if (isNil(firstActive)) {
          // nothing to activate, start polling for new activities so we don't rely on subscriptions
          setCurrentActivity(undefined)
          startPolling(POLLING_DELAY)
        } else {
          // we have something to activate, stop polling, no need for it
          setCurrentActivity(firstActive)
          stopPolling()
        }
      }
      infoLog({
        msg: 'Fetched activities for session',
        activities,
        current,
        numberOfActivities: activities.length,
      })
    }
  }, [activities, loading])

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    errorLog({ msg: 'Failed to load activities' }, error)
    return <ErrorPage title={t('activities.loading_error')} onRetry={refetch} />
  }

  const waitingForNewActivities = isNil(currentActivity)

  return (
    <ActivityContext.Provider
      value={{ currentActivity, waitingForNewActivities }}
    >
      {children}
    </ActivityContext.Provider>
  )
}
