import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../types'

export const useIntakeScheduling = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      eventId,
    }: {
      activityId: string
      eventId: string
    }) => {
      const dataPoints: DataPoints = [{ key: 'eventId', value: eventId }]

      return _onSubmit(activityId, dataPoints)
    },
    [_onSubmit]
  )

  return {
    isSubmitting,
    onSubmit,
  }
}
