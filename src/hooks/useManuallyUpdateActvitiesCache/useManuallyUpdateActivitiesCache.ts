import type { Activity, GetHostedSessionActivitiesQuery } from './types'
import { useApolloClient } from '@apollo/client'
import { updateQuery } from '../../services/graphql'
import { GetHostedSessionActivitiesDocument } from './types'

interface UpdateSessionActivitiesQueryParams {
  updatedActivity: Activity | undefined
}

interface UseManuallyUpdateActivitiesCacheHook {
  updateSessionActivitiesQuery: (
    // eslint-disable-next-line no-unused-vars
    updatedActivityObject: UpdateSessionActivitiesQueryParams
  ) => void
}
/**
 * This hook forces the Apollo Cache to update the session activities.
 */
export const useManuallyUpdateActivitiesCache =
  (): UseManuallyUpdateActivitiesCacheHook => {
    const client = useApolloClient()

    const updateSessionActivitiesQuery = ({
      updatedActivity,
    }: {
      updatedActivity: Activity | undefined
    }) => {
      if (updatedActivity === undefined) {
        return
      }

      const variables = {
        only_stakeholder_activities: true,
      }

      const currentQuery = client.readQuery({
        query: GetHostedSessionActivitiesDocument,
        variables,
      }) as GetHostedSessionActivitiesQuery

      const updatedActivities =
        currentQuery.hostedSessionActivities.activities.map((activity) => {
          if (activity.id === updatedActivity.id) {
            return updatedActivity
          }
          return activity
        })

      const updatedQuery = updateQuery<
        GetHostedSessionActivitiesQuery,
        Array<Activity>
      >(
        currentQuery as GetHostedSessionActivitiesQuery,
        ['hostedSessionActivities', 'activities'],
        updatedActivities
      )

      client.writeQuery({
        query: GetHostedSessionActivitiesDocument,
        variables,
        data: updatedQuery,
      })
    }

    return {
      updateSessionActivitiesQuery,
    }
  }
