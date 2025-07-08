/* eslint-disable react-hooks/exhaustive-deps */
import isNil from 'lodash/isNil'
import { useEffect, useMemo } from 'react'
import {
  Activity,
  useOnSessionActivityCompletedSubscription,
  useOnSessionActivityCreatedSubscription,
  useOnSessionActivityExpiredSubscription,
  useGetHostedSessionActivitiesQuery,
  ActivityStatus,
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
  const { data, error, loading, refetch, startPolling, stopPolling } =
    useGetHostedSessionActivitiesQuery({
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

  const onActivityCreated = useOnSessionActivityCreatedSubscription({
    variables,
  })

  /**
   * Why use these subscriptions if we don't do anything with the data ?
   * Because the apollo cache already does the job for us. Any activity that is
   * returned via these subscriptions will automatically be updated in the cache,
   * which means the `activities` array will also be automatically updated.
   */
  useOnSessionActivityCompletedSubscription({ variables })
  useOnSessionActivityExpiredSubscription({ variables })

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

  const activities = allActivities.filter(filterActivity).sort(sortByDate)

  useEffect(() => {
    if (!isNil(onActivityCreated.data)) {
      refetch()
    }
  }, [onActivityCreated.data, router.query])

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
