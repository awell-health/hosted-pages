import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, Message } from './types'
import { useGetMessageQuery, useMarkMessageAsReadMutation } from './types'
import { captureException } from '@sentry/nextjs'
import { GraphQLError } from 'graphql'
import { useLogging } from '../useLogging'
import { LogEvent } from '../useLogging/types'
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

    try {
      await markMessageAsRead({ variables: markMessageAsReadVariables })
      infoLog(
        `Message ${message_id} marked as read successfully for activity ${activity.object.name}`,
        { activity },
        LogEvent.MESSAGE_MARKED_AS_READ
      )
    } catch (error: any) {
      errorLog(
        `Failed to mark message ${message_id} as read for activity ${activity.object.name}`,
        { activity },
        error,
        LogEvent.MESSAGE_MARKING_AS_READ_FAILED
      )
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
