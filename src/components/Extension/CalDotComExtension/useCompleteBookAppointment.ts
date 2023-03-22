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
        { key: 'bookingId', value: `${data?.booking?.id}` },
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
