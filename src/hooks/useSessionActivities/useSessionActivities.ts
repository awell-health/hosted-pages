/* eslint-disable react-hooks/exhaustive-deps */
import { useApolloClient } from '@apollo/client'
import { isNil } from 'lodash'
import { useEffect } from 'react'
import { updateQuery } from '../../services/graphql'
import {
  Activity,
  useOnSessionActivityCompletedSubscription,
  useOnSessionActivityUpdatedSubscription,
  useOnSessionActivityCreatedSubscription,
  useGetHostedSessionActivitiesQuery,
  GetHostedSessionActivitiesQueryVariables,
  GetHostedSessionActivitiesDocument,
  GetHostedSessionActivitiesQuery,
  PathwayActivitiesQuery,
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
  const { data, error, loading } = useGetHostedSessionActivitiesQuery({
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

  const activities = data?.hostedSessionActivities.activities ?? []

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
  }, [onActivityCreated, onActivityCreated.data, variables])

  return { activities, loading, error: error?.message }
}