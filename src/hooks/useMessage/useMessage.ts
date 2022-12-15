import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, Message } from './types'
import { useGetMessageQuery, useMarkMessageAsReadMutation } from './types'
import { useCurrentActivity } from '../activityNavigation'
import { captureException } from '@sentry/nextjs'
import { GraphQLError } from 'graphql'
interface UseMessageActivityHook {
  loading: boolean
  message?: Message
  error?: string
  onRead: () => Promise<void>
  refetch?: () => void
}

export const useMessage = ({
  activity,
}: {
  activity: Activity
}): UseMessageActivityHook => {
  const { t } = useTranslation()
  const {
    id: activity_id,
    object: { id: message_id },
  } = activity
  const { handleNavigateToNextActivity } = useCurrentActivity()

  const [markMessageAsRead] = useMarkMessageAsReadMutation()

  const variables = { id: message_id }
  const { data, loading, error, refetch } = useGetMessageQuery({
    variables,
    onError: (error) => {
      captureException(error, {
        contexts: {
          message: {
            message_id,
          },
          activity: {
            ...activity,
          },
          graphql: {
            query: 'GetMessage',
            variables: JSON.stringify(variables),
          },
        },
      })
      GraphQLError
    },
  })

  const onRead = async () => {
    try {
      await markMessageAsRead({
        variables: {
          input: {
            activity_id: activity_id,
          },
        },
      })
      handleNavigateToNextActivity()
    } catch (err) {
      toast.error(t('activities.message.toast_mark_as_read_error'))
      captureException(err, {
        contexts: {
          graphql: {
            query: 'MarkMessageAsRead',
            variables: JSON.stringify({
              input: {
                activity_id,
              },
            }),
          },
        },
      })
    }
  }

  if (loading) {
    return {
      loading,
      onRead,
    }
  }

  if (error) {
    return {
      error: error.message,
      loading: false,
      onRead,
      refetch,
    }
  }

  return {
    loading,
    message: data?.message.message,
    onRead,
    refetch,
  }
}
