import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'

export const useCollectMedication = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      medicationData,
    }: {
      activityId: string
      medicationData: string
    }) => {
      const dataPoints: DataPoints = [
        { key: 'medicationData', value: medicationData }, // JSON data point value type
        { key: 'medicationDataString', value: medicationData }, // String data point value type
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
