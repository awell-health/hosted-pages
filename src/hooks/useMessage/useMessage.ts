import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, Message } from './types'
import { useGetMessageQuery, useMarkMessageAsReadMutation } from './types'
import * as Sentry from '@sentry/nextjs'
import { GraphQLError } from 'graphql'
import { useHostedSession } from '../useHostedSession'
import { logger, LogEvent } from '../../utils/logging'
import { HostedSessionError } from '../../utils/errors'
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
  const { session } = useHostedSession()

  const variables = { id: message_id }
  const { data, loading, error, refetch } = useGetMessageQuery({
    variables,
    onError: (error) => {
      const hostedSessionError = new HostedSessionError(
        'Failed to get message',
        {
          errorType: 'MESSAGE_FETCH_FAILED',
          operation: 'GetMessage',
          activityId: activity.id,
          originalError: error,
        }
      )
      Sentry.captureException(hostedSessionError, {
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
      logger.info(
        `Message ${message_id} marked as read successfully for activity ${activity.object.name}`,
        LogEvent.MESSAGE_MARKED_AS_READ,
        {
          sessionId: session?.id,
          pathwayId: session?.pathway_id,
          stakeholderId: session?.stakeholder?.id,
          sessionStatus: session?.status,
          activity,
        }
      )
    } catch (error: any) {
      const hostedSessionError = new HostedSessionError(
        `Failed to mark message ${message_id} as read for activity ${activity.object.name}`,
        {
          errorType: 'MESSAGE_MARKING_AS_READ_FAILED',
          operation: 'MarkMessageAsRead',
          activityId: activity.id,
          originalError: error,
        }
      )
      Sentry.captureException(hostedSessionError, {
        contexts: {
          graphql: {
            query: 'MarkMessageAsRead',
            variables: JSON.stringify(markMessageAsReadVariables),
          },
        },
      })
      logger.error(
        `Failed to mark message ${message_id} as read for activity ${activity.object.name}`,
        LogEvent.MESSAGE_MARKING_AS_READ_FAILED,
        {
          sessionId: session?.id,
          pathwayId: session?.pathway_id,
          stakeholderId: session?.stakeholder?.id,
          sessionStatus: session?.status,
          activity,
          error: error instanceof Error ? error.message : String(error),
        }
      )
      toast.error(t('activities.message.toast_mark_as_read_error'))
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
