import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'

export const useEnterMedication = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      stringifiedMedication,
    }: {
      activityId: string
      stringifiedMedication: string
    }) => {
      const dataPoints: DataPoints = [
        { key: 'stringifiedMedicationData', value: stringifiedMedication },
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
