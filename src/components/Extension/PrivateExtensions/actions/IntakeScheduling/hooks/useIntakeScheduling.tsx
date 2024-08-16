import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../types'

export const useIntakeScheduling = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      eventId,
      date,
    }: {
      activityId: string
      eventId: string
      date: Date
    }) => {
      const dataPoints: DataPoints = [
        { key: 'eventId', value: eventId },
        {
          key: 'date',
          value: date.toISOString(),
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
