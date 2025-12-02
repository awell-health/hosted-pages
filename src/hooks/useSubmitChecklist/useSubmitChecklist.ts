import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity } from './types'
import { useSubmitChecklistMutation } from './types'
import * as Sentry from '@sentry/nextjs'
import { useHostedSession } from '../useHostedSession'
import { logger, LogEvent } from '../../utils/logging'
import { HostedSessionError } from '../../utils/errors'

interface UseChecklistHook {
  onSubmit: () => Promise<void>
  isSubmitting: boolean
}

export const useSubmitChecklist = (activity: Activity): UseChecklistHook => {
  const { t } = useTranslation()
  const { id: activity_id } = activity
  const [submitChecklist] = useSubmitChecklistMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { session } = useHostedSession()

  const onSubmit = async () => {
    setIsSubmitting(true)
    const variables = {
      input: {
        activity_id: activity_id,
      },
    }
    logger.info(
      `Submitting checklist for activity ${activity.object.name}`,
      LogEvent.CHECKLIST_SUBMITTING,
      {
        sessionId: session?.id,
        pathwayId: session?.pathway_id,
        stakeholderId: session?.stakeholder?.id,
        sessionStatus: session?.status,
        activity,
        variables,
      }
    )
    try {
      await submitChecklist({ variables })
      logger.info(
        `Checklist ${activity.object.name} submitted successfully`,
        LogEvent.CHECKLIST_SUBMITTED,
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
        `Failed to submit checklist for activity ${activity.object.name}`,
        {
          errorType: 'CHECKLIST_SUBMITTING_FAILED',
          operation: 'SubmitChecklist',
          activityId: activity.id,
          originalError: error,
        }
      )
      Sentry.captureException(hostedSessionError, {
        contexts: {
          activity,
          graphql: {
            query: 'SubmitChecklist',
            variables: JSON.stringify(variables),
          },
        },
      })
      logger.error(
        `Failed to submit checklist for activity ${activity.object.name}`,
        LogEvent.CHECKLIST_SUBMITTING_FAILED,
        {
          sessionId: session?.id,
          pathwayId: session?.pathway_id,
          stakeholderId: session?.stakeholder?.id,
          sessionStatus: session?.status,
          activity,
          variables,
          error: error instanceof Error ? error.message : String(error),
        }
      )
      setIsSubmitting(false)
      toast.error(t('activities.checklist.saving_error'))
    }
  }

  return {
    onSubmit,
    isSubmitting,
  }
}
