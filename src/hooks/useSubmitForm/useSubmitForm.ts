import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, AnswerInput } from './types'
import { useSubmitFormResponseMutation } from './types'
import * as Sentry from '@sentry/nextjs'
import { isNil } from 'lodash'
import { getErrorMessage } from './utils'
import { useHostedSession } from '../useHostedSession'
import { logger, LogEvent } from '../../utils/logging'
import { HostedSessionError } from '../../utils/errors'
interface UseFormActivityHook {
  onSubmit: (response: Array<AnswerInput>) => Promise<boolean>
  isSubmitting: boolean
}

export const useSubmitForm = (activity: Activity): UseFormActivityHook => {
  const { t } = useTranslation()
  const { id: activity_id } = activity

  const [submitFormResponse] = useSubmitFormResponseMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { session } = useHostedSession()

  /**
   *
   * @param response Form response
   * @returns true if the form response was successfully submitted
   */
  const onSubmit = async (response: Array<AnswerInput>): Promise<boolean> => {
    setIsSubmitting(true)
    const variables = {
      input: {
        activity_id,
        response,
      },
    }

    logger.info(
      `Trying to submit a form response for activity ${activity.object.name}`,
      LogEvent.FORM_SUBMITTING,
      {
        sessionId: session?.id,
        pathwayId: session?.pathway_id,
        stakeholderId: session?.stakeholder?.id,
        sessionStatus: session?.status,
        activity,
      }
    )
    try {
      const { errors } = await submitFormResponse({ variables })

      if (!isNil(errors) && errors.length > 0) {
        throw new Error(
          errors[0].message ??
            'Something went wrong while submitting the form response'
        )
      }

      logger.info(
        `Form response ${activity.object.name} submitted successfully`,
        LogEvent.FORM_SUBMITTED,
        {
          sessionId: session?.id,
          pathwayId: session?.pathway_id,
          stakeholderId: session?.stakeholder?.id,
          sessionStatus: session?.status,
          activity,
        }
      )
      setIsSubmitting(false)

      return true
    } catch (error: any) {
      const hostedSessionError = new HostedSessionError(
        `Failed to submit form response for activity ${activity.object.name}`,
        {
          errorType: 'FORM_SUBMISSION_FAILED',
          operation: 'SubmitFormResponse',
          activityId: activity.id,
          originalError: error,
        }
      )
      Sentry.captureException(hostedSessionError, {
        contexts: {
          activity,
          form: {
            response: JSON.stringify(variables),
          },
          graphql: {
            query: 'SubmitFormResponse',
            variables: JSON.stringify(variables),
          },
        },
      })
      logger.error(
        `Failed to submit form response for activity ${activity.object.name}`,
        LogEvent.FORM_SUBMISSION_FAILED,
        {
          sessionId: session?.id,
          pathwayId: session?.pathway_id,
          stakeholderId: session?.stakeholder?.id,
          sessionStatus: session?.status,
          response,
          activity,
          error: error instanceof Error ? error.message : String(error),
        }
      )
      setIsSubmitting(false)
      const errorText = getErrorMessage(
        error,
        t('activities.form.saving_error')
      )
      toast.error(errorText)
      return false
    }
  }

  return {
    onSubmit,
    isSubmitting,
  }
}
