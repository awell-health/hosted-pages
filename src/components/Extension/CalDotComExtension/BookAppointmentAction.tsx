import React, { FC, useCallback, useEffect, useMemo } from 'react'
import { useTheme } from '@awell-health/ui-library'
import { CalDotComSchedulingWithOrigin } from './CalDotComSchedulingWithOrigin'
import { mapActionFieldsToObject, mapSettingsToObject } from '../utils'
import { useCompleteBookAppointment } from './useCompleteBookAppointment'

import type {
  BookAppointmentFields,
  BookingSuccessfulFunction,
  CalDotComExtensionSettings,
} from './types'
import type { ExtensionActivityRecord } from '../types'

interface BookAppointmentActionProps {
  activityDetails: ExtensionActivityRecord
}

export const BookAppointmentAction: FC<BookAppointmentActionProps> = ({
  activityDetails,
}) => {
  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { activity_id, fields, settings, pathway_id } = activityDetails
  const { onSubmit } = useCompleteBookAppointment()

  const { calLink } = useMemo(
    () => mapActionFieldsToObject<BookAppointmentFields>(fields),
    [fields]
  )

  const { calOrigin } = useMemo(
    () => mapSettingsToObject<CalDotComExtensionSettings>(settings),
    [settings]
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
    <CalDotComSchedulingWithOrigin
      calLink={calLink}
      calOrigin={calOrigin}
      metadata={{
        awellPathwayId: pathway_id,
        awellActivityId: activity_id,
      }}
      onBookingSuccessful={onBookingSuccessful}
    />
  )
}

BookAppointmentAction.displayName = 'BookAppointmentAction'
