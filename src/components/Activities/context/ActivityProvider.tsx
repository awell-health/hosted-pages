/* eslint-disable react-hooks/exhaustive-deps */
import { isNil } from 'lodash'
import { useTranslation } from 'next-i18next'
import React, { FC, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { ErrorPage, LoadingPage } from '../../'
import { LogEvent, useLogging } from '../../../hooks/useLogging'
import { useSessionActivities } from '../../../hooks/useSessionActivities'
import { useCompleteSession } from '../../../hooks/useCompleteSession'
import { Activity, ActivityStatus } from '../types'
import { ActivityContext, ActivityContextInterface } from './ActivityContext'
import { ActivityReferenceType } from '../../../types/generated/types-orchestration'
import useLocalStorage from 'use-local-storage'

const POLLING_INTERVAL = 5000 // 5 seconds
const POLLING_TIMEOUT = 30000 // 30 seconds
const AGENT_ACTIVITY_POLLING_TIMEOUT = 300000 // 5 minutes

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
  const [, setLogoOverride] = useLocalStorage('awell-hp-logo-override', '')
  const router = useRouter()
  const [currentActivity, setCurrentActivity] = useState<Activity>()
  const [state, setState] =
    useState<ActivityContextInterface['state']>('polling')
  const {
    activities,
    loading,
    error,
    refetch,
    startPolling,
    stopPolling,
    isActivityComplete,
  } = useSessionActivities()
  const { infoLog, errorLog } = useLogging()
  const { onCompleteSession, isCompleting } = useCompleteSession()

  // Array of strings combining activity id and status.
  // Used as a dependency for the effect to ensure it only runs when the set or status of activities changes,
  // rather than on every new array reference.
  const activityKeys = useMemo(
    () => activities.map((a) => `${a.id}:${a.status}`).join(','),
    [activities]
  )

  // activities list changes as we get new activities from the server or as we complete activities
  // this useEffect drives whole AHP logic, only by activities being changed in apollo cache
  // and base on their status do we determine what to show to the user
  useEffect(() => {
    const activityWithLogoOverride = activities.find(
      (a) => a.status === ActivityStatus.Active && a.metadata?.ahp_logo_override
    )
    if (activityWithLogoOverride) {
      setLogoOverride(activityWithLogoOverride.metadata.ahp_logo_override)
    } else {
      setLogoOverride('')
    }
    // get current from the list, it may be updated
    const current = activities.find(({ id }) => id === currentActivity?.id)
    infoLog(
      `Activities list changed`,
      {
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
        const hasAgentActivity = activities.some(
          (a) => a.reference_type === ActivityReferenceType.Agent
        )
        const newState = hasAgentActivity ? 'polling-extended' : 'polling'
        // Only update state if it's different to prevent unnecessary re-renders
        if (state !== newState) {
          setState(newState)
        }
      } else {
        // we have something to activate, stop polling, no need for it
        setCurrentActivity(firstActive)
        stopPolling()
      }
    }
  }, [activityKeys])

  useEffect(() => {
    switch (state) {
      case 'polling': {
        startPolling(POLLING_INTERVAL)
        const timer = setTimeout(() => {
          infoLog(
            `No active activity found after ${POLLING_TIMEOUT}ms, setting state to no-active-activity`,
            {
              currentActivity,
              activities,
            },
            LogEvent.ACTIVITY_NO_ACTIVE_FOUND
          )
          setState('no-active-activity')
        }, POLLING_TIMEOUT)
        return () => {
          clearTimeout(timer)
        }
      }
      case 'polling-extended': {
        startPolling(AGENT_ACTIVITY_POLLING_TIMEOUT)
        const timer = setTimeout(() => {
          infoLog(
            `No active activity found after ${AGENT_ACTIVITY_POLLING_TIMEOUT}ms, setting state to no-active-activity`,
            {
              currentActivity,
              activities,
            },
            LogEvent.ACTIVITY_NO_ACTIVE_FOUND
          )
          setState('no-active-activity')
        }, AGENT_ACTIVITY_POLLING_TIMEOUT)
        return () => {
          clearTimeout(timer)
        }
      }
      case 'active-activity-found': {
        stopPolling()
        break
      }
      case 'no-active-activity': {
        stopPolling()
        break
      }
    }
  }, [state])

  useEffect(() => {
    infoLog(
      `Current activity changed to ${currentActivity?.id} (${currentActivity?.object.type} - ${currentActivity?.object.name})`,
      { currentActivity },
      LogEvent.ACTIVITY_CHANGED
    )
    if (!isNil(currentActivity)) {
      setState('active-activity-found')
    }
  }, [currentActivity])

  useEffect(() => {
    // we're only handling individual activities here --
    if (isActivityComplete && !isCompleting && router.query.sessionId) {
      void onCompleteSession(router.query.sessionId as string)
    }
  }, [
    isActivityComplete,
    isCompleting,
    router.query.sessionId,
    onCompleteSession,
  ])

  if (loading || isNil(currentActivity) || !isActive(currentActivity)) {
    return <LoadingPage />
  }

  if (error) {
    errorLog(
      `Failed to load activities`,
      {},
      error,
      LogEvent.ACTIVITIES_FETCH_FAILED
    )
    return <ErrorPage title={t('activities.loading_error')} onRetry={refetch} />
  }

  return (
    <ActivityContext.Provider value={{ currentActivity, state }}>
      {children}
    </ActivityContext.Provider>
  )
}
