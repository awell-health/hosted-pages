import { useState } from 'react'
import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity } from './types'
import { useSubmitChecklistMutation } from './types'
import { captureException } from '@sentry/nextjs'
import { useLogging } from '../useLogging'
import { LogEvent } from '../useLogging/types'

interface UseChecklistHook {
  onSubmit: () => Promise<void>
  isSubmitting: boolean
}

export const useSubmitChecklist = (activity: Activity): UseChecklistHook => {
  const { t } = useTranslation()
  const { id: activity_id } = activity
  const [submitChecklist] = useSubmitChecklistMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { infoLog, errorLog } = useLogging()

  const onSubmit = async () => {
    setIsSubmitting(true)
    const variables = {
      input: {
        activity_id: activity_id,
      },
    }
    infoLog(
      `Submitting checklist for activity ${activity.object.name}`,
      {
        activity,
        variables,
      },
      LogEvent.CHECKLIST_SUBMITTING
    )
    try {
      await submitChecklist({ variables })
      infoLog(
        `Checklist ${activity.object.name} submitted successfully`,
        {
          activity,
        },
        LogEvent.CHECKLIST_SUBMITTED
      )
    } catch (error: any) {
      errorLog(
        `Failed to submit checklist for activity ${activity.object.name}`,
        {
          activity,
          variables,
        },
        error,
        LogEvent.CHECKLIST_SUBMITTING_FAILED
      )
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
