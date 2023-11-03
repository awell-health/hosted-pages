import { useCallback, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import { captureException } from '@sentry/nextjs'
import { useCurrentActivity } from '../../components/Activities'
import { type DataPoints, useCompleteExtensionActivityMutation } from './types'

interface UseCompleteExtensionActivityHook {
  onSubmit: (activity_id: string, data_points: DataPoints) => Promise<void>
  isSubmitting: boolean
}

export const useCompleteExtensionActivity =
  (): UseCompleteExtensionActivityHook => {
    const { t } = useTranslation()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [completeExtensionActivity] = useCompleteExtensionActivityMutation()
    const { unsetCurrentActivity } = useCurrentActivity()

    const onSubmit: UseCompleteExtensionActivityHook['onSubmit'] = useCallback(
      async (activity_id, data_points) => {
        setIsSubmitting(true)
        const variables = {
          input: {
            activity_id,
            data_points,
          },
        }
        try {
          await completeExtensionActivity({ variables })
          unsetCurrentActivity(activity_id)
        } catch (error) {
          toast.error(t('activities.checklist.saving_error'))
          captureException(error, {
            contexts: {
              activity: {
                activity_id,
              },
              graphql: {
                query: 'CompleteExtensionActivity',
                variables: JSON.stringify(variables),
              },
            },
          })
        } finally {
          setIsSubmitting(false)
        }
      },
      [completeExtensionActivity, t]
    )

    return {
      onSubmit,
      isSubmitting,
    }
  }
