import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity } from './types'
import { useSubmitChecklistMutation } from './types'
import { useCurrentActivity } from '../activityNavigation'
import { captureException } from '@sentry/nextjs'

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
      toast.error(t('activities.checklist.saving_error'))
      captureException(error, {
        contexts: {
          activity,
          graphql: {
            query: 'SubmitChecklist',
            variables: JSON.stringify({
              input: {
                activity_id,
              },
            }),
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
