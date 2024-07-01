import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, AnswerInput } from './types'
import { useSubmitFormResponseMutation } from './types'
import { captureException } from '@sentry/nextjs'
import { useLogging } from '../useLogging'
import { LogEvent } from '../useLogging/types'
import { isNil } from 'lodash'
interface UseFormActivityHook {
  onSubmit: (response: Array<AnswerInput>) => Promise<boolean>
  isSubmitting: boolean
}

export const useSubmitForm = (activity: Activity): UseFormActivityHook => {
  const { t } = useTranslation()
  const { id: activity_id } = activity

  const [submitFormResponse] = useSubmitFormResponseMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { infoLog, errorLog } = useLogging()

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

    infoLog(
      {
        msg: 'Trying to submit a form response',
        activity,
      },
      LogEvent.FORM_SUBMITTING
    )
    try {
      const { errors } = await submitFormResponse({ variables })

      if (!isNil(errors) && errors.length > 0) {
        throw new Error(
          errors[0].message ??
            'Something went wrong while submitting the form response'
        )
      }

      infoLog(
        { msg: 'Form response submitted', activity },
        LogEvent.FORM_SUBMITTED
      )
      setIsSubmitting(false)

      return true
    } catch (error: any) {
      errorLog(
        {
          msg: 'Failed to submit form response',
          response,
          activity,
        },
        error,
        LogEvent.FORM_SUBMISSION_FAILED
      )
      setIsSubmitting(false)
      toast.error(t('activities.form.saving_error'))
      captureException(error, {
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
      return false
    }
  }

  return {
    onSubmit,
    isSubmitting,
  }
}
