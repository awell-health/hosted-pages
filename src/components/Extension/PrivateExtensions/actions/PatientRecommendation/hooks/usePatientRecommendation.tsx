import { useCallback } from 'react'
import {
  DataPoints,
  useCompleteExtensionActivity,
} from '../../EnterMedication/types'

export const usePatientRecommendation = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      acceptRecommendation,
    }: {
      activityId: string
      acceptRecommendation: boolean
    }) => {
      const dataPoints: DataPoints = [
        { key: 'acceptRecommendation', value: String(acceptRecommendation) },
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
