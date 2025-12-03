import { useCallback, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import { type DataPoints, useCompleteExtensionActivityMutation } from './types'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'

interface UseCompleteExtensionActivityHook {
  onSubmit: (activity_id: string, data_points: DataPoints) => Promise<void>
  isSubmitting: boolean
}

export const useCompleteExtensionActivity =
  (): UseCompleteExtensionActivityHook => {
    const { t } = useTranslation()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [completeExtensionActivity] = useCompleteExtensionActivityMutation()

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
        } catch (error) {
          toast.error(t('activities.checklist.saving_error'))
          const hostedSessionError = new HostedSessionError(
            'Failed to complete extension activity',
            {
              errorType: 'EXTENSION_ACTIVITY_COMPLETION_FAILED',
              operation: 'CompleteExtensionActivity',
              activityId: activity_id,
              originalError: error,
              contexts: {
                activity: {
                  activity_id,
                },
                graphql: {
                  query: 'CompleteExtensionActivity',
                  variables: JSON.stringify(variables),
                },
              },
            }
          )
          captureHostedSessionError(hostedSessionError)
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
