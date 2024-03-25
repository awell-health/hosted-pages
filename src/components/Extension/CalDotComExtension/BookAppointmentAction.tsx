import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { CalDotComScheduling, useTheme } from '@awell-health/ui-library'
import { mapActionFieldsToObject } from '../utils'
import { useCompleteBookAppointment } from './useCompleteBookAppointment'

import type { BookAppointmentFields, BookingSuccessfulFunction } from './types'
import type { ExtensionActivityRecord } from '../types'

interface BookAppointmentActionProps {
  activityDetails: ExtensionActivityRecord
}

export const BookAppointmentAction: FC<BookAppointmentActionProps> = ({
  activityDetails,
}) => {
  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { activity_id, fields, pathway_id } = activityDetails
  const { onSubmit } = useCompleteBookAppointment()

  const { calLink } = useMemo(
    () => mapActionFieldsToObject<BookAppointmentFields>(fields),
    [fields]
  )

  const onBookingSuccessful: BookingSuccessfulFunction = useCallback(
    (data) => {
      onSubmit(activity_id, data)
    },
    [activity_id, onSubmit]
  )

  useEffect(() => {
    updateLayoutMode('flexible')

    return () => {
      // Reset to default mode on unmount
      resetLayoutMode()
    }
  }, [])

  return (
    <CalDotComScheduling
      calLink={calLink}
      metadata={{
        awellPathwayId: pathway_id,
        awellActivityId: activity_id,
      }}
      onBookingSuccessful={onBookingSuccessful}
    />
  )
}

BookAppointmentAction.displayName = 'BookAppointmentAction'
