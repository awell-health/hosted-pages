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
    const id = toast.loading(t('saving'))
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
      toast.update(id, {
        render: t('saving_success'),
        type: 'success',
        isLoading: false,
        autoClose: 500,
      })

      handleNavigateToNextActivity()
    } catch (error) {
      setIsSubmitting(false)
      toast.update(id, {
        render: t('form_saving_error'),
        type: 'error',
        isLoading: false,
      })
    }
  }

  return {
    onSubmit,
    disabled: isSubmitting,
  }
}
