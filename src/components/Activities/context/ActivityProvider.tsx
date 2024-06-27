/* eslint-disable react-hooks/exhaustive-deps */
import { isNil } from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { Activity, ActivityStatus } from '../types'
import { useSessionActivities } from '../../../hooks/useSessionActivities'
import { useTranslation } from 'next-i18next'
import { ErrorPage, LoadingPage } from '../../'
import { ActivityContext } from './ActivityContext'
import { useLogging } from '../../../hooks/useLogging'
import { LogEvent } from '../../../hooks/useLogging/types'

const POLLING_DELAY = 5000 // 5 seconds

interface ActivityProviderProps {
  children?: React.ReactNode
}

const isActive = (activity: Activity | undefined) =>
  activity?.status === ActivityStatus.Active

/**
 * TODO: Remove the granular logs once we have successfully diagnosed the issue with the
 * same activities being loaded multiple times.
 */

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

      infoLog(
        {
          msg: 'Activities list changed',
          activities,
          prevCurrentActivity: currentActivity,
          nextCurrentActivity: current,
          numberOfActivities: activities.length,
        },
        LogEvent.ACTIVITIES_LIST_CHANGED
      )

      // try and change current activity if it's not active
      if (!isActive(current)) {
        const firstActive = activities.find(isActive)
        if (isNil(firstActive)) {
          // nothing to activate, start polling for new activities so we don't rely on subscriptions
          setCurrentActivity(undefined)
          startPolling(POLLING_DELAY)

          infoLog(
            { msg: 'No active activity found, starting polling' },
            LogEvent.ACTIVITIES_START_POLLING
          )
        } else {
          // we have something to activate, stop polling, no need for it
          setCurrentActivity(firstActive)
          stopPolling()

          infoLog(
            { msg: 'Active activity found, stopping polling', firstActive },
            LogEvent.ACTIVITIES_STOP_POLLING
          )
        }
      } else {
        infoLog(
          { msg: 'Current activity is active', current },
          LogEvent.ACTIVITY_IS_ACTIVE
        )
      }
      infoLog(
        {
          msg: 'Fetched activities for session',
          activities,
          current,
          numberOfActivities: activities.length,
        },
        LogEvent.ACTIVITIES_FETCH
      )
    }
  }, [activities, loading])

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    errorLog(
      { msg: 'Failed to load activities' },
      error,
      LogEvent.ACTIVITIES_FETCH_FAILED
    )
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
