import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'

interface SigningResult {
  signed: boolean
  envelopeStatus: string
  recipientStatus: string
  completedAt: string
}

export const useCompleteEmbeddedSigningAction = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async (activityId: string, result: SigningResult) => {
      const dataPoints: DataPoints = [
        { key: 'signed', value: String(result.signed) },
        { key: 'envelopeStatus', value: result.envelopeStatus },
        { key: 'recipientStatus', value: result.recipientStatus },
        { key: 'completedAt', value: result.completedAt },
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
