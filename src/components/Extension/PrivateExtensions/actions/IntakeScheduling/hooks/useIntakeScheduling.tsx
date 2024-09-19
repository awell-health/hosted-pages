import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../types'

interface OnSubmitProps {
  activityId: string
  eventId: string
  providerId: string
  slotDate: string
  slotDateOnlyLocaleString: string
  slotTimeOnlyLocaleString: string
  facility: string
  eventLocationType: string
  providerPreferences: string
}

export const useIntakeScheduling = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      eventId,
      providerId,
      slotDate,
      slotDateOnlyLocaleString,
      slotTimeOnlyLocaleString,
      facility,
      eventLocationType,
      providerPreferences,
    }: OnSubmitProps) => {
      const dataPoints: DataPoints = [
        { key: 'eventId', value: eventId },
        { key: 'providerId', value: providerId },
        { key: 'slotDate', value: slotDate },
        {
          key: 'slotDateOnlyLocaleString',
          value: slotDateOnlyLocaleString,
        },
        {
          key: 'slotTimeOnlyLocaleString',
          value: slotTimeOnlyLocaleString,
        },
        { key: 'facility', value: facility },
        { key: 'eventLocationType', value: eventLocationType },
        { key: 'providerPreferences', value: providerPreferences },
      ]
      console.log('onCompleteActivity', {
        dataPoints,
      })
      return _onSubmit(activityId, dataPoints)
    },
    [_onSubmit]
  )

  return {
    isSubmitting,
    onSubmit,
  }
}
