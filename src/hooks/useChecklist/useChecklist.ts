import type { ChecklistItem, Activity } from './types'
import { useGetChecklistQuery } from './types'
import { captureException } from '@sentry/nextjs'
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
      captureException(error, {
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
      })
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
