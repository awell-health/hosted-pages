import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity } from './types'
import { useSubmitChecklistMutation } from './types'
import { captureException } from '@sentry/nextjs'
import { useCurrentActivity } from '../../components/Activities'

interface UseChecklistHook {
  onSubmit: () => Promise<void>
  isSubmitting: boolean
}

export const useSubmitChecklist = (activity: Activity): UseChecklistHook => {
  const { t } = useTranslation()
  const { id: activity_id } = activity
  const [submitChecklist] = useSubmitChecklistMutation()
  const { unsetCurrentActivity } = useCurrentActivity()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async () => {
    setIsSubmitting(true)
    const variables = {
      input: {
        activity_id: activity_id,
      },
    }
    try {
      await submitChecklist({ variables })
      unsetCurrentActivity()
    } catch (error) {
      setIsSubmitting(false)
      toast.error(t('activities.checklist.saving_error'))
      captureException(error, {
        contexts: {
          activity,
          graphql: {
            query: 'SubmitChecklist',
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
