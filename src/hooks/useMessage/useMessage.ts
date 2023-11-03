import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, Message } from './types'
import { useGetMessageQuery, useMarkMessageAsReadMutation } from './types'
import { captureException } from '@sentry/nextjs'
import { GraphQLError } from 'graphql'
import { useCurrentActivity } from '../../components/Activities'
interface UseMessageActivityHook {
  loading: boolean
  message?: Message
  error?: string
  onRead: () => Promise<void>
  refetch?: () => void
}

export const useMessage = (activity: Activity): UseMessageActivityHook => {
  const { t } = useTranslation()
  const {
    id: activity_id,
    object: { id: message_id },
  } = activity
  const [markMessageAsRead] = useMarkMessageAsReadMutation()
  const { unsetCurrentActivity } = useCurrentActivity()

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
    const markMessageAsReadVariables = {
      input: {
        activity_id,
      },
    }
    try {
      await markMessageAsRead({ variables: markMessageAsReadVariables })
      unsetCurrentActivity(activity.id)
    } catch (err) {
      toast.error(t('activities.message.toast_mark_as_read_error'))
      captureException(err, {
        contexts: {
          graphql: {
            query: 'MarkMessageAsRead',
            variables: JSON.stringify(markMessageAsReadVariables),
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
