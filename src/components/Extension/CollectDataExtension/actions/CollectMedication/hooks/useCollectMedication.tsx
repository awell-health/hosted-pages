import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'

export const useCollectMedication = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      medicationDataAsJson,
    }: {
      activityId: string
      medicationDataAsJson: string
    }) => {
      const dataPoints: DataPoints = [
        { key: 'medicationData', value: medicationDataAsJson },
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
