import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../types'

export const useReviewMedicationExtraction = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      validatedData,
    }: {
      activityId: string
      validatedData: string
    }) => {
      const dataPoints: DataPoints = [
        {
          key: 'validatedData',
          value: validatedData,
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
