/* eslint-disable react-hooks/exhaustive-deps */
import { useApolloClient } from '@apollo/client'
import { isEmpty, isNil, sortBy } from 'lodash'
import { useEffect } from 'react'
import { updateQuery } from '../../services/graphql'
import {
  Activity,
  useOnSessionActivityCompletedSubscription,
  useOnSessionActivityCreatedSubscription,
  useOnSessionActivityExpiredSubscription,
  useGetHostedSessionActivitiesQuery,
  GetHostedSessionActivitiesDocument,
  GetHostedSessionActivitiesQuery,
} from './types'
import { captureException } from '@sentry/nextjs'
import { useRouter } from 'next/router'
interface UsePathwayActivitiesHook {
  loading: boolean
  activities: Array<Activity>
  error?: string
  refetch?: () => {}
  startPolling: (pollInterval: number) => void
  stopPolling: () => void
}

export const useSessionActivities = (): UsePathwayActivitiesHook => {
  const variables = {
    only_stakeholder_activities: true,
  }
  const client = useApolloClient()
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

  const sortActivitiesByDate = (activities: Activity[]): Activity[] => {
    console.log('activities', activities)
    if (isNil(activities) || isEmpty(activities)) {
      return []
    }
    if (!isNil(router.query.activity_id)) {
      return sortBy(
        activities.filter((a) => a.id === router.query.activity_id),
        (activity) => {
          return new Date(activity.date)
        }
      )
    }
    if (!isNil(router.query.track_id)) {
      return sortBy(
        activities.filter((a) => a.context?.track_id === router.query.track_id),
        (activity) => {
          return new Date(activity.date)
        }
      )
    }
    return sortBy(activities, (activity) => {
      return new Date(activity.date)
    })
  }

  const activities = sortActivitiesByDate(
    data?.hostedSessionActivities.activities ?? []
  )

  useEffect(() => {
    if (!isNil(onActivityCreated.data)) {
      const {
        data: { sessionActivityCreated },
      } = onActivityCreated
      const updatedActivities = sortActivitiesByDate([
        sessionActivityCreated,
        ...activities,
      ])
      const updatedQuery = updateQuery<
        GetHostedSessionActivitiesQuery,
        Array<Activity>
      >(
        data as GetHostedSessionActivitiesQuery,
        ['hostedSessionActivities', 'activities'],
        updatedActivities
      )
      client.writeQuery({
        query: GetHostedSessionActivitiesDocument,
        variables,
        data: updatedQuery,
      })
    }
  }, [onActivityCreated.data, router.query])

  return {
    activities,
    loading,
    error: error?.message,
    refetch,
    startPolling,
    stopPolling,
  }
}
