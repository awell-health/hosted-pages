import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, AnswerInput } from './types'
import { useSubmitFormResponseMutation } from './types'
import { useCurrentActivity } from '../activityNavigation'

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

    try {
      await submitFormResponse({
        variables: {
          input: {
            activity_id,
            response,
          },
        },
      })
      handleNavigateToNextActivity()
    } catch (error) {
      setIsSubmitting(false)
      toast.error(t('activities.form.saving_error'))
    }
  }

  return {
    onSubmit,
    disabled: isSubmitting,
  }
}
