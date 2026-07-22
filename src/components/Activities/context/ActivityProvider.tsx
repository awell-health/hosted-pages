/* eslint-disable react-hooks/exhaustive-deps */
import { isNil } from 'lodash'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import React, { FC, useEffect, useMemo, useState } from 'react'
import useLocalStorage from 'use-local-storage'
import { ErrorPage, LoadingPage } from '../../'
import { useCompleteSession } from '../../../hooks/useCompleteSession'
import { useHostedSession } from '../../../hooks/useHostedSession'
import { useSessionActivities } from '../../../hooks/useSessionActivities'
import {
  ActivityReferenceType,
  HostedSessionStatus,
} from '../../../types/generated/types-orchestration'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../../utils/errors'
import { LogEvent, logger } from '../../../utils/logging'
import { Activity, ActivityStatus } from '../types'
import { ActivityContext, ActivityContextInterface } from './ActivityContext'

const POLLING_INTERVAL = 5000 // 5 seconds
const DEFAULT_POLLING_TIMEOUT = 30000 // 30 seconds
const MAX_POLLING_TIMEOUT = 300000 // 5 minutes (maximum allowed override, also used for agent activities)

/**
 * Parse and validate the pollingTimeout query parameter.
 * Returns a value between DEFAULT_POLLING_TIMEOUT and MAX_POLLING_TIMEOUT.
 */
const getPollingTimeout = (pollingTimeoutParam: string | undefined): number => {
  if (!pollingTimeoutParam) {
    return DEFAULT_POLLING_TIMEOUT
  }

  const parsed = parseInt(pollingTimeoutParam, 10)
  if (isNaN(parsed) || parsed <= 0) {
    return DEFAULT_POLLING_TIMEOUT
  }

  // Clamp to maximum allowed value
  return Math.min(parsed, MAX_POLLING_TIMEOUT)
}

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

  // Get polling timeout from query parameter (supports per-session override for demos)
  const pollingTimeout = getPollingTimeout(
    router.query.pollingTimeout as string | undefined
  )
  const {
    activities,
    loading,
    error,
    refetch,
    startPolling,
    stopPolling,
    isActivityComplete,
  } = useSessionActivities()
  const { session } = useHostedSession()
  const { onCompleteSession, isCompleting } = useCompleteSession()
  const isSessionActive = session?.status === HostedSessionStatus.Active

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
    if (!isSessionActive) {
      stopPolling()
      return
    }

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
    logger.info('Activities list changed', LogEvent.ACTIVITIES_LIST_CHANGED, {
      activities,
      prevCurrentActivity: currentActivity,
      nextCurrentActivity: current,
      numberOfActivities: activities.length,
    })

    // try and change current activity if it's not active
    if (!isActive(current)) {
      const firstActive = activities.find(isActive)
      if (isNil(firstActive)) {
        // nothing to activate, start polling for new activities so we don't rely on subscriptions
        setCurrentActivity(undefined)
        const hasAgentActivity = activities.some(
          (a) => a.reference_type === ActivityReferenceType.Agent
        )
        const nextState = hasAgentActivity ? 'polling-extended' : 'polling'
        // Use functional update to prevent unnecessary re-renders
        setState((prev) => (prev === nextState ? prev : nextState))
      } else {
        // we have something to activate, stop polling, no need for it
        setCurrentActivity(firstActive)
        stopPolling()
      }
    }
  }, [activityKeys, isSessionActive])

  useEffect(() => {
    if (!isSessionActive) {
      stopPolling()
      return
    }

    switch (state) {
      case 'polling': {
        startPolling(POLLING_INTERVAL)
        const timer = setTimeout(() => {
          logger.info(
            `No active activity found after ${pollingTimeout}ms, setting state to no-active-activity`,
            LogEvent.ACTIVITY_NO_ACTIVE_FOUND,
            {
              currentActivity,
              activities,
              pollingTimeout,
            }
          )
          setState('no-active-activity')
        }, pollingTimeout)
        return () => {
          clearTimeout(timer)
          stopPolling()
        }
      }
      case 'polling-extended': {
        startPolling(MAX_POLLING_TIMEOUT)
        const timer = setTimeout(() => {
          logger.info(
            `No active activity found after ${MAX_POLLING_TIMEOUT}ms, setting state to no-active-activity`,
            LogEvent.ACTIVITY_NO_ACTIVE_FOUND,
            {
              currentActivity,
              activities,
            }
          )
          setState('no-active-activity')
        }, MAX_POLLING_TIMEOUT)
        return () => {
          clearTimeout(timer)
          stopPolling()
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
  }, [state, pollingTimeout, isSessionActive])

  useEffect(() => {
    logger.info(
      `Current activity changed to ${currentActivity?.id} (${currentActivity?.object.type} - ${currentActivity?.object.name})`,
      LogEvent.ACTIVITY_CHANGED,
      {
        currentActivity,
      }
    )
    if (!isNil(currentActivity)) {
      setState('active-activity-found')
    }
  }, [currentActivity])

  useEffect(() => {
    // we're only handling individual activities here --
    if (
      isSessionActive &&
      isActivityComplete &&
      !isCompleting &&
      router.query.sessionId
    ) {
      void onCompleteSession(router.query.sessionId as string)
    }
  }, [
    isSessionActive,
    isActivityComplete,
    isCompleting,
    router.query.sessionId,
    onCompleteSession,
  ])

  // Only show loading page during initial GraphQL query load
  // Let Activities component handle state-based rendering (polling, no-active-activity, etc.)
  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    const hostedSessionError = new HostedSessionError(
      'Failed to load activities',
      {
        errorType: 'ACTIVITIES_FETCH_FAILED',
        operation: 'GetSessionActivities',
        originalError: error,
        contexts: {
          graphql: {
            query: 'GetSessionActivities',
          },
        },
      }
    )
    captureHostedSessionError(hostedSessionError)
    logger.error(
      'Failed to load activities',
      LogEvent.ACTIVITIES_FETCH_FAILED,
      {
        error: error || 'Unknown error',
      }
    )
    return <ErrorPage title={t('activities.loading_error')} onRetry={refetch} />
  }

  return (
    <ActivityContext.Provider value={{ currentActivity, state }}>
      {children}
    </ActivityContext.Provider>
  )
}
