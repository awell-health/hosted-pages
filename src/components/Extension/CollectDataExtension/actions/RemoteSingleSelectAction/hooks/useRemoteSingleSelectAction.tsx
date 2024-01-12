import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'

export const useRemoteSingleSelectAction = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      label,
      value,
    }: {
      activityId: string
      label: string
      value: string
    }) => {
      const dataPoints: DataPoints = [
        { key: 'label', value: String(label) },
        { key: 'value', value: String(value) },
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
