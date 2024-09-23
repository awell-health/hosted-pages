import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../types'

interface OnSubmitProps {
  activityId: string
  eventId: string
  providerId: string
  patientTimezone: string
  providerPreferences: string
}

export const useIntakeScheduling = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      eventId,
      providerId,
      patientTimezone,
      providerPreferences,
    }: OnSubmitProps) => {
      const dataPoints: DataPoints = [
        { key: 'eventId', value: eventId },
        { key: 'providerId', value: providerId },
        {
          key: 'patientTimezone',
          value: patientTimezone,
        },
        { key: 'providerPreferences', value: providerPreferences },
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
