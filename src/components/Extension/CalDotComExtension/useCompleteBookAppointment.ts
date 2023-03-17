import { useCallback } from 'react'
import {
  BookingSuccessfulFunctionArg,
  DataPoints,
  useCompleteExtensionActivity,
} from './types'

export const useCompleteBookAppointment = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async (activityId: string, data: BookingSuccessfulFunctionArg) => {
      const dataPoints: DataPoints = [
        {
          key: 'date',
          value: data?.date ? new Date(data.date).toISOString() : '',
        },
        { key: 'eventTypeId', value: `${data?.eventType?.id}` },
        // ! temporary placeholder until https://github.com/calcom/cal.com/discussions/6668 is resolved
        { key: 'bookingId', value: '' },
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
