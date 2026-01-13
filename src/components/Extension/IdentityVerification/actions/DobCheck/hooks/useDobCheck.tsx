import { useCallback, useState } from 'react'
import { isEmpty } from 'lodash'
import { useTranslation } from 'next-i18next'
import { useCompleteExtensionActivity } from '../../../types'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../../../../../utils/errors'

type UseDobCheckHook = ({
  pathway_id,
  activity_id,
}: {
  pathway_id: string
  activity_id: string
}) => {
  loading: boolean
  isSubmitting: boolean
  onSubmit: (dob: string) => Promise<void>
}

export const useDobCheck: UseDobCheckHook = ({ pathway_id, activity_id }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const handleActivityCompletion = useCallback(
    async ({ activityId }: { activityId: string }) => {
      return _onSubmit(activityId, [{ key: 'success', value: String(true) }])
    },
    [_onSubmit]
  )

  const onSubmit = useCallback(
    async (dob: string) => {
      if (isEmpty(dob)) {
        alert(t('activities.identity_verification.error_empty'))
        return
      }

      try {
        setLoading(true)
        const response = await fetch('/api/identity/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dob: dob, pathway_id, activity_id }),
        })

        setLoading(false)

        if (!response.ok) {
          throw new Error('Failed to check dob')
        }

        const jsonRes = await response.json()

        if (!jsonRes?.success) {
          alert(t('activities.identity_verification.error_no_match'))
          return
        }

        handleActivityCompletion({ activityId: activity_id })
      } catch (error) {
        setLoading(false)
        const hostedSessionError = new HostedSessionError(
          'Failed to check date of birth',
          {
            errorType: 'DOB_CHECK_FAILED',
            activityId: activity_id,
            originalError: error,
            contexts: {
              dobCheck: {
                pathway_id,
                activity_id,
              },
            },
          }
        )
        captureHostedSessionError(hostedSessionError)
        alert(t('activities.identity_verification.error_failed'))
      }
    },
    [pathway_id, activity_id, handleActivityCompletion, t]
  )

  return {
    loading,
    isSubmitting,
    onSubmit,
  }
}
