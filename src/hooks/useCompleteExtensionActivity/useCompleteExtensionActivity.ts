import { useCallback, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import { captureException } from '@sentry/nextjs'

import { type DataPoints, useCompleteExtensionActivityMutation } from './types'
import { useCurrentActivity } from '../activityNavigation'
import { useManuallyUpdateActivitiesCache } from '../useManuallyUpdateActvitiesCache'

interface UseCompleteExtensionActivityHook {
  onSubmit: (activity_id: string, data_points: DataPoints) => Promise<void>
  isSubmitting: boolean
}

export const useCompleteExtensionActivity =
  (): UseCompleteExtensionActivityHook => {
    const { t } = useTranslation()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [completeExtensionActivity] = useCompleteExtensionActivityMutation()
    const { handleNavigateToNextActivity } = useCurrentActivity()
    const { updateSessionActivitiesQuery } = useManuallyUpdateActivitiesCache()

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
          const completeExtensionMutationResult =
            await completeExtensionActivity({
              variables,
              refetchQueries: ['GetHostedSessionActivities'],
            })
          updateSessionActivitiesQuery({
            updatedActivity:
              completeExtensionMutationResult.data?.completeExtensionActivity
                .activity,
          })
          handleNavigateToNextActivity()
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
