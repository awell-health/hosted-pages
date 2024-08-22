import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../types'
import { isNil } from 'lodash'

interface OnSubmitProps {
  activityId: string
  eventId: string
  dateString: string
  timeString: string
  providerId: string
}

export const useIntakeScheduling = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      eventId,
      dateString,
      timeString,
      providerId,
    }: OnSubmitProps) => {
      const dataPoints: DataPoints = [
        { key: 'eventId', value: eventId },
        {
          key: 'slotDate',
          value: dateString,
        },
        {
          key: 'slotTime',
          value: timeString,
        },
      ]
      if (!isNil(providerId)) {
        dataPoints.push({
          key: 'providerId',
          value: providerId,
        })
      }
      return _onSubmit(activityId, dataPoints)
    },
    [_onSubmit]
  )

  return {
    isSubmitting,
    onSubmit,
  }
}
