import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  HostedSessionError,
  captureHostedSessionError,
  serializeError,
} from '../../utils/errors'
import { LogEvent, logger } from '../../utils/logging'
import type { Activity } from './types'
import { useSubmitChecklistMutation } from './types'

interface UseChecklistHook {
  onSubmit: () => Promise<void>
  isSubmitting: boolean
}

export const useSubmitChecklist = (activity: Activity): UseChecklistHook => {
  const { t } = useTranslation()
  const { id: activity_id } = activity
  const [submitChecklist] = useSubmitChecklistMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          contexts: {
            activity,
            graphql: {
              query: 'SubmitChecklist',
              variables: JSON.stringify(variables),
            },
          },
        }
      )
      captureHostedSessionError(hostedSessionError)
      logger.error(
        `Failed to submit checklist for activity ${activity.object.name}`,
        LogEvent.CHECKLIST_SUBMITTING_FAILED,
        {
          activity,
          variables,
          error: serializeError(error),
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
