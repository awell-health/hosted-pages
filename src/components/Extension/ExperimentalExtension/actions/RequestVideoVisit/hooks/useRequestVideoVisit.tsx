import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'

export const useRequestVideoVisit = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      requestVideoVisit,
    }: {
      activityId: string
      requestVideoVisit: boolean
    }) => {
      const dataPoints: DataPoints = [
        { key: 'requestVideoVisit', value: String(requestVideoVisit) },
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
