import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, AnswerInput } from './types'
import { useSubmitFormResponseMutation } from './types'
import { useCurrentActivity } from '../activityNavigation'
import { captureException } from '@sentry/nextjs'
interface UseFormActivityHook {
  disabled: boolean
  onSubmit: (response: Array<AnswerInput>) => Promise<void>
}

export const useSubmitForm = ({
  activity,
}: {
  activity: Activity
}): UseFormActivityHook => {
  const { t } = useTranslation()
  const { id: activity_id } = activity
  const { handleNavigateToNextActivity } = useCurrentActivity()

  const [submitFormResponse] = useSubmitFormResponseMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (response: Array<AnswerInput>) => {
    setIsSubmitting(true)
    const variables = {
      input: {
        activity_id,
        response,
      },
    }

    try {
      await submitFormResponse({
        variables,
      })
      handleNavigateToNextActivity()
    } catch (error) {
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
    disabled: isSubmitting,
  }
}
