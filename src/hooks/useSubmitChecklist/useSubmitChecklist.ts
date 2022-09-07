import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity } from './types'
import { useSubmitChecklistMutation } from './types'
import { useCurrentActivity } from '../activityNavigation'

interface UseChecklistHook {
  onSubmit: () => Promise<void>
  isSubmitting: boolean
}

export const useSubmitChecklist = ({
  activity,
}: {
  activity: Activity
}): UseChecklistHook => {
  const { t } = useTranslation()
  const { id: activity_id } = activity
  const { handleNavigateToNextActivity } = useCurrentActivity()
  const [submitChecklist] = useSubmitChecklistMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async () => {
    const id = toast.loading(t('saving'))
    setIsSubmitting(true)

    try {
      await submitChecklist({
        variables: {
          input: {
            activity_id,
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
        render: t('checklist_saving_error'),
        type: 'error',
        isLoading: false,
      })
    }
  }

  return {
    onSubmit,
    isSubmitting,
  }
}
