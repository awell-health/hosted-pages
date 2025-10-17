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
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/router'
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
      captureException(error, {
        contexts: {
          graphql: {
            query: 'GetHostedSessionActivities',
            variables: JSON.stringify(variables),
          },
        },
      })
    },
  })

  /**
   * Set up subscriptions to automatically update the activities array in the cache
   * when activities are created, completed, or expired.
   * Using subscribeToMore ensures the subscription data is properly merged into the query result.
   */
  useEffect(() => {
    // Subscribe to new activities being created
    const unsubscribeCreated = subscribeToMore({
      document: OnSessionActivityCreatedDocument,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev

        const subData = subscriptionData.data as any
        console.log('OnSessionActivityCreated subscriptionData', subData)
        const newActivity = subData.sessionActivityCreated
        const existingActivities = prev.hostedSessionActivities.activities

        // Check if activity already exists to avoid duplicates
        if (existingActivities.some((a) => a.id === newActivity.id)) {
          return prev
        }

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
    const unsubscribeCompleted = subscribeToMore({
      document: OnSessionActivityCompletedDocument,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev

        const subData = subscriptionData.data as any
        console.log('OnSessionActivityCompleted subscriptionData', subData)
        const completedActivity = subData.sessionActivityCompleted
        const existingActivities = prev.hostedSessionActivities.activities

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
    const unsubscribeExpired = subscribeToMore({
      document: OnSessionActivityExpiredDocument,
      variables,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev

        const subData = subscriptionData.data as any
        console.log('OnSessionActivityExpired subscriptionData', subData)
        const expiredActivity = subData.sessionActivityExpired
        const existingActivities = prev.hostedSessionActivities.activities

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
