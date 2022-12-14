/* eslint-disable react-hooks/exhaustive-deps */
import { useApolloClient } from '@apollo/client'
import { isEmpty, isNil, sortBy } from 'lodash'
import { useEffect } from 'react'
import { updateQuery } from '../../services/graphql'
import {
  Activity,
  useOnSessionActivityCompletedSubscription,
  useOnSessionActivityUpdatedSubscription,
  useOnSessionActivityCreatedSubscription,
  useGetHostedSessionActivitiesQuery,
  GetHostedSessionActivitiesDocument,
  GetHostedSessionActivitiesQuery,
} from './types'

interface UsePathwayActivitiesHook {
  loading: boolean
  activities: Array<Activity>
  error?: string
}

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
  useOnSessionActivityUpdatedSubscription({ variables })
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
    const myInterval = setInterval(() => {
      refetch()
    }, 10000)
    // clear interval on component unmount
    return () => clearInterval(myInterval)
  })

  useEffect(() => {
    if (!isNil(onActivityCreated.data)) {
      const {
        data: { sessionActivityCreated },
      } = onActivityCreated
      const updatedActivities = [sessionActivityCreated, ...activities]
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

  return { activities, loading, error: error?.message }
}
