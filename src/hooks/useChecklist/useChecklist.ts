import type { ChecklistItem, Activity } from './types'
import { useGetChecklistQuery } from './types'
import { captureException } from '@sentry/nextjs'
interface UseChecklistHook {
  loading: boolean
  error?: string
  title?: string
  items?: Array<ChecklistItem>
}

export const useChecklist = ({
  activity,
}: {
  activity: Activity
}): UseChecklistHook => {
  const {
    object: { id: checklist_id },
  } = activity

  const { data, loading, error } = useGetChecklistQuery({
    variables: {
      id: checklist_id,
    },
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
            variables: JSON.stringify({ id: checklist_id }),
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
  }
}
