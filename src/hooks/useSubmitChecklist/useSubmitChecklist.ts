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
    setIsSubmitting(true)

    try {
      await submitChecklist({
        variables: {
          input: {
            activity_id,
          },
        },
      })
      handleNavigateToNextActivity()
    } catch (error) {
      setIsSubmitting(false)
      toast.error(t('checklist_saving_error'))
    }
  }

  return {
    onSubmit,
    isSubmitting,
  }
}
