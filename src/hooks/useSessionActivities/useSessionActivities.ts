/* eslint-disable react-hooks/exhaustive-deps */
import isNil from 'lodash/isNil'
import { useEffect, useMemo } from 'react'
import {
  Activity,
  useGetHostedSessionActivitiesQuery,
  ActivityStatus,
  OnSessionActivityCreatedDocument,
  OnSessionActivityCompletedDocument,
  OnSessionActivityExpiredDocument,
} from './types'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/router'
import {
  OnSessionActivityCompletedSubscription,
  OnSessionActivityCreatedSubscription,
  OnSessionActivityExpiredSubscription,
} from '../../types/generated/types-orchestration'
import { useHostedSession } from '../useHostedSession'
import { logger, LogEvent } from '../../utils/logging'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'
interface UsePathwayActivitiesHook {
  loading: boolean
  activities: Array<Activity>
  isActivityComplete: boolean
  error?: string
  refetch?: () => {}
  startPolling: (pollInterval: number) => void
  stopPolling: () => void
}

export const useSessionActivities = (): UsePathwayActivitiesHook => {
  const variables = {
    only_stakeholder_activities: true,
  }
  const router = useRouter()
  const { session } = useHostedSession()
  const {
    data,
    error,
    loading,
    refetch,
    startPolling,
    stopPolling,
    subscribeToMore,
  } = useGetHostedSessionActivitiesQuery({
    variables,
    onError: (error) => {
      const hostedSessionError = new HostedSessionError(
        'Failed to get hosted session activities',
        {
          errorType: 'ACTIVITIES_FETCH_FAILED',
          operation: 'GetHostedSessionActivities',
          originalError: error,
          contexts: {
            graphql: {
              query: 'GetHostedSessionActivities',
              variables: JSON.stringify(variables),
            },
          },
        }
      )
      captureHostedSessionError(hostedSessionError)
    },
  })

  /**
   * Set up subscriptions to automatically update the activities array in the cache
   * when activities are created, completed, or expired.
   * Using subscribeToMore ensures the subscription data is properly merged into the query result.
   */
  useEffect(() => {
    // Subscribe to new activities being created
    const unsubscribeCreated =
      subscribeToMore<OnSessionActivityCreatedSubscription>({
        document: OnSessionActivityCreatedDocument,
        variables,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev

          const subData = subscriptionData.data
          const newActivity = subData.sessionActivityCreated
          const existingActivities = prev.hostedSessionActivities.activities

          // Check if activity already exists to avoid duplicates
          if (existingActivities.some((a) => a.id === newActivity.id)) {
            logger.warn(
              `Activity ${newActivity.id} already exists, skipping duplicate`,
              LogEvent.SUBSCRIPTION_ACTIVITY_DUPLICATE,
              {
                sessionId: session?.id,
                pathwayId: session?.pathway_id,
                stakeholderId: session?.stakeholder?.id,
                sessionStatus: session?.status,
                activityId: newActivity.id,
                activityType: newActivity.object.type,
              }
            )
            return prev
          }

          logger.info(
            `New activity created via subscription: ${newActivity.id} (${newActivity.object.type} - ${newActivity.object.name})`,
            LogEvent.SUBSCRIPTION_ACTIVITY_CREATED,
            {
              sessionId: session?.id,
              pathwayId: session?.pathway_id,
              stakeholderId: session?.stakeholder?.id,
              sessionStatus: session?.status,
              activityId: newActivity.id,
              activityType: newActivity.object.type,
              activityName: newActivity.object.name,
              status: newActivity.status,
            }
          )

          // Add new activity to the array
          return {
            ...prev,
            hostedSessionActivities: {
              ...prev.hostedSessionActivities,
              activities: [...existingActivities, newActivity],
            },
          }
        },
      })

    // Subscribe to activities being completed (status change)
    const unsubscribeCompleted =
      subscribeToMore<OnSessionActivityCompletedSubscription>({
        document: OnSessionActivityCompletedDocument,
        variables,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev

          const subData = subscriptionData.data
          const completedActivity = subData.sessionActivityCompleted
          const existingActivities = prev.hostedSessionActivities.activities

          logger.info(
            `Activity completed via subscription: ${completedActivity.id} (${completedActivity.object.type} - ${completedActivity.object.name})`,
            LogEvent.SUBSCRIPTION_ACTIVITY_COMPLETED,
            {
              sessionId: session?.id,
              pathwayId: session?.pathway_id,
              stakeholderId: session?.stakeholder?.id,
              sessionStatus: session?.status,
              activityId: completedActivity.id,
              activityType: completedActivity.object.type,
              activityName: completedActivity.object.name,
              status: completedActivity.status,
            }
          )

          // Update the activity in the array with the new status
          return {
            ...prev,
            hostedSessionActivities: {
              ...prev.hostedSessionActivities,
              activities: existingActivities.map((a) =>
                a.id === completedActivity.id ? completedActivity : a
              ),
            },
          }
        },
      })

    // Subscribe to activities being expired (status change)
    const unsubscribeExpired =
      subscribeToMore<OnSessionActivityExpiredSubscription>({
        document: OnSessionActivityExpiredDocument,
        variables,
        updateQuery: (prev, { subscriptionData }) => {
          if (!subscriptionData.data) return prev
          const subData = subscriptionData.data
          const expiredActivity = subData.sessionActivityExpired
          const existingActivities = prev.hostedSessionActivities.activities

          logger.info(
            `Activity expired via subscription: ${expiredActivity.id} (${expiredActivity.object.type} - ${expiredActivity.object.name})`,
            LogEvent.SUBSCRIPTION_ACTIVITY_EXPIRED,
            {
              sessionId: session?.id,
              pathwayId: session?.pathway_id,
              stakeholderId: session?.stakeholder?.id,
              sessionStatus: session?.status,
              activityId: expiredActivity.id,
              activityType: expiredActivity.object.type,
              activityName: expiredActivity.object.name,
              status: expiredActivity.status,
            }
          )

          // Update the activity in the array with the new status
          return {
            ...prev,
            hostedSessionActivities: {
              ...prev.hostedSessionActivities,
              activities: existingActivities.map((a) =>
                a.id === expiredActivity.id ? expiredActivity : a
              ),
            },
          }
        },
      })

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeCreated()
      unsubscribeCompleted()
      unsubscribeExpired()
    }
  }, [])

  const filterActivity = (activity: Activity): boolean => {
    if (!isNil(router.query.activity_id)) {
      return activity.id === router.query.activity_id
    }
    if (!isNil(router.query.track_id)) {
      return activity.context?.track_id === router.query.track_id
    }
    return true
  }

  const sortByDate = (a: Activity, b: Activity): number => {
    return new Date(a.date).getTime() - new Date(b.date).getTime()
  }

  const allActivities = data?.hostedSessionActivities.activities ?? []

  // Memoize activities to prevent unnecessary array recreations
  // which could cause infinite loops in components that depend on this
  const activities = useMemo(() => {
    return allActivities.filter(filterActivity).sort(sortByDate)
  }, [allActivities, router.query.activity_id, router.query.track_id])

  /**
   * We want to redirect directly after individual activity completion, so this handler is a special case.
   */
  const isActivityComplete = useMemo(() => {
    const { activity_id } = router.query
    if (!isNil(activity_id)) {
      return allActivities.some(
        (activity) =>
          activity.id === activity_id && activity.status === ActivityStatus.Done
      )
    }
    return false
  }, [router.query, allActivities])

  return {
    activities,
    loading,
    isActivityComplete,
    error: error?.message,
    refetch,
    startPolling,
    stopPolling,
  }
}
