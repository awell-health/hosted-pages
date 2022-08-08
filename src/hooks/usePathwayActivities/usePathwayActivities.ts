/* eslint-disable react-hooks/exhaustive-deps */
import { useApolloClient } from '@apollo/client'
import { isNil } from 'lodash'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { updateQuery } from '../../services/graphql'
// import { updateQuery } from '@awell/libs-web/graphql'
import {
  Activity,
  usePathwayActivitiesQuery,
  useOnActivityCompletedSubscription,
  useOnActivityCreatedSubscription,
  useOnActivityUpdatedSubscription,
  PathwayActivitiesQueryVariables,
  PathwayActivitiesQuery,
  PathwayActivitiesDocument,
} from './types'

interface UsePathwayActivitiesHook {
  loading: boolean
  activities: Array<Activity>
}

export const usePathwayActivities = ({
  pathwayId,
}: {
  pathwayId: string
}): UsePathwayActivitiesHook => {
  const { t } = useTranslation()
  const variables: PathwayActivitiesQueryVariables = {
    pathway_id: pathwayId,
  }
  const client = useApolloClient()
  const { data, error, loading } = usePathwayActivitiesQuery({
    variables,
  })

  const onActivityCreated = useOnActivityCreatedSubscription({ variables })

  /**
   * Why use these subscriptions if we don't do anything with the data ?
   * Because the apollo cache already does the job for us. Any activity that is
   * returned via these subscriptions will automatically be updated in the cache,
   * which means the `activities` array will also be automatically updated.
   */
  useOnActivityUpdatedSubscription({ variables })
  useOnActivityCompletedSubscription({ variables })

  const activities = data?.pathwayActivities.activities ?? []

  useEffect(() => {
    if (!isNil(onActivityCreated.data)) {
      const {
        data: { activityCreated },
      } = onActivityCreated
      const updatedActivities = [activityCreated, ...activities]
      const updatedQuery = updateQuery<PathwayActivitiesQuery, Array<Activity>>(
        data as PathwayActivitiesQuery,
        ['pathwayActivities', 'activities'],
        updatedActivities
      )
      client.writeQuery({
        query: PathwayActivitiesDocument,
        variables,
        data: updatedQuery,
      })
    }
  }, [onActivityCreated, onActivityCreated.data, variables])

  return { activities, loading }
}
