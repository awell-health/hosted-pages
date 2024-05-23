import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, Message } from './types'
import { useGetMessageQuery, useMarkMessageAsReadMutation } from './types'
import { captureException } from '@sentry/nextjs'
import { GraphQLError } from 'graphql'
import { useLogging } from '../useLogging'
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
  const { infoLog, errorLog } = useLogging()

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

    infoLog({ msg: 'Trying to mark message as read', activity })
    try {
      await markMessageAsRead({ variables: markMessageAsReadVariables })
      infoLog({ msg: 'Message marked as read successfully', activity })
    } catch (error: any) {
      errorLog({ msg: 'Failed to mark message as read', activity }, error)
      toast.error(t('activities.message.toast_mark_as_read_error'))
      captureException(error, {
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
