import type { ChecklistItem, Activity } from './types'
import { useGetChecklistQuery } from './types'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'
interface UseChecklistHook {
  loading: boolean
  error?: string
  title?: string
  items?: Array<ChecklistItem>
  refetch?: () => void
}

export const useChecklist = (activity: Activity): UseChecklistHook => {
  const {
    object: { id: checklist_id },
  } = activity

  const variables = {
    id: checklist_id,
  }

  const { data, loading, error, refetch } = useGetChecklistQuery({
    variables,
    onError: (error) => {
      const hostedSessionError = new HostedSessionError(
        'Failed to get checklist',
        {
          errorType: 'CHECKLIST_FETCH_FAILED',
          operation: 'GetChecklist',
          activityId: activity.id,
          originalError: error,
          contexts: {
            checklist: {
              checklist_id,
            },
            activity: {
              ...activity,
            },
            graphql: {
              query: 'GetChecklist',
              variables: JSON.stringify(variables),
            },
          },
        }
      )
      captureHostedSessionError(hostedSessionError)
    },
  })

  if (loading) {
    return {
      loading,
    }
  }

  if (error) {
    return {
      loading: false,
      error: error.message,
      refetch,
    }
  }

  // @ts-expect-error
  const { items = [], title = '' } = data?.checklist.checklist

  const formatted_items = items.map((item: string, index: number) => {
    return { id: index.toString(), label: item }
  })

  return {
    loading,
    title,
    items: formatted_items,
    refetch,
  }
}
