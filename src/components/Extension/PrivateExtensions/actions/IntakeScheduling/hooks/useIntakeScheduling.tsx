import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../types'
import { isNil } from 'lodash'

interface OnSubmitProps {
  activityId: string
  eventId: string
  providerId: string
  slotDate: string
  slotDateOnlyLocaleString: string
  slotTimeOnlyLocaleString: string
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
