import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'

export const useCompleteEmbeddedSigningAction = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async (activityId: string, { signed }: { signed: boolean }) => {
      const dataPoints: DataPoints = [{ key: 'signed', value: String(signed) }]

      return _onSubmit(activityId, dataPoints)
    },
    [_onSubmit]
  )

  return {
    isSubmitting,
    onSubmit,
  }
}
