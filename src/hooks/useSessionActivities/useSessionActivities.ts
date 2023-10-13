/* eslint-disable react-hooks/exhaustive-deps */
import { useApolloClient } from '@apollo/client'
import { isEmpty, isNil, sortBy } from 'lodash'
import { useEffect } from 'react'
import { updateQuery } from '../../services/graphql'
import {
  Activity,
  useOnSessionActivityCompletedSubscription,
  useOnSessionActivityCreatedSubscription,
  useGetHostedSessionActivitiesQuery,
  GetHostedSessionActivitiesDocument,
  GetHostedSessionActivitiesQuery,
  ActivityStatus,
} from './types'
import { captureException } from '@sentry/nextjs'

interface UsePathwayActivitiesHook {
  loading: boolean
  activities: Array<Activity>
  error?: string
  refetch?: () => {}
}

const POLLING_DELAY = 5000 // 5 seconds

export const useSessionActivities = ({
  onlyStakeholderActivities,
}: {
  onlyStakeholderActivities: boolean
}): UsePathwayActivitiesHook => {
  const variables = {
    only_stakeholder_activities: onlyStakeholderActivities,
  }
  const client = useApolloClient()
  const { data, error, loading, refetch } = useGetHostedSessionActivitiesQuery({
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

  const sortActivitiesByDate = (activities: Activity[]): Activity[] => {
    if (isNil(activities) || isEmpty(activities)) {
      return []
    }
    return sortBy(activities, (activity) => {
      return new Date(activity.date)
    })
  }

  const activities =
    sortActivitiesByDate(
      data?.hostedSessionActivities.activities as Activity[]
    ) ?? []

  // temporary solution to refetch query when subscription does not work
  useEffect(() => {
    let refetchQueryInterval: NodeJS.Timer | undefined

    /**
     * Note: refetch() activities can return error if we continuously
     * call it again and again.
     */

    /**
     * Only try to refetch activities if there are none found.
     * That means we would only risk showing an error message
     * when a user is waiting for activities to load, not when
     * they are actively interacting with one.
     */

    const activeActivities = activities.filter(
      ({ status }) => status === ActivityStatus.Active
    )

    if (activeActivities.length === 0) {
      refetchQueryInterval = setInterval(() => {
        refetch()
      }, POLLING_DELAY)
    }

    if (activeActivities.length !== 0 && !isNil(refetchQueryInterval)) {
      clearInterval(refetchQueryInterval)
    }

    // clear interval on component unmount
    return () => clearInterval(refetchQueryInterval)
  }, [activities])

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
  }, [onActivityCreated.data])

  return { activities, loading, error: error?.message, refetch }
}
