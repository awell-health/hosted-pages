import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../types'

interface OnSubmitProps {
  activityId: string
  providerFullName?: string
  providerReference?: string
  providerId?: string
}

export const useRequestingProviderLookUp = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      providerFullName,
      providerReference,
      providerId,
    }: OnSubmitProps) => {
      const dataPoints: DataPoints = [
        { key: 'providerFullName', value: providerFullName || '' },
        { key: 'providerReference', value: providerReference || '' },
        {
          key: 'providerId',
          value: providerId || '',
        },
      ]
      return _onSubmit(activityId, dataPoints)
    },
    [_onSubmit]
  )

  return {
    isSubmitting,
    onSubmit,
  }
}
