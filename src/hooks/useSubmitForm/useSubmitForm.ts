import { isNil } from 'lodash'
import { useTranslation } from 'next-i18next'
import { useState } from 'react'
import { toast } from 'react-toastify'
import {
  HostedSessionError,
  captureHostedSessionError,
  serializeError,
} from '../../utils/errors'
import { LogEvent, logger } from '../../utils/logging'
import { useHostedSession } from '../useHostedSession'
import type { Activity, AnswerInput } from './types'
import { useSubmitFormResponseMutation } from './types'
import { getErrorMessage } from './utils'
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
        }
      )
      captureHostedSessionError(hostedSessionError)
      logger.error(
        `Failed to submit form response for activity ${activity.object.name}`,
        LogEvent.FORM_SUBMISSION_FAILED,
        {
          response,
          activity,
          error: serializeError(error),
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
