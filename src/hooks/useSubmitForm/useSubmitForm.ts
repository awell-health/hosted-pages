import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, AnswerInput } from './types'
import { useSubmitFormResponseMutation } from './types'
import { captureException } from '@sentry/nextjs'
import { useLogging } from '../useLogging'
import { LogEvent } from '../useLogging/types'
interface UseFormActivityHook {
  onSubmit: (response: Array<AnswerInput>) => Promise<void>
  isSubmitting: boolean
}

export const useSubmitForm = (activity: Activity): UseFormActivityHook => {
  const { t } = useTranslation()
  const { id: activity_id } = activity

  const [submitFormResponse] = useSubmitFormResponseMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { infoLog, errorLog } = useLogging()

  const onSubmit = async (response: Array<AnswerInput>) => {
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
      await submitFormResponse({ variables })
      infoLog(
        { msg: 'Form response submitted', activity },
        LogEvent.FORM_SUBMITTED
      )
      setIsSubmitting(false)
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
    }
  }

  return {
    onSubmit,
    isSubmitting,
  }
}
