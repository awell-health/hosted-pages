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
  const { activity_id, fields, pathway_id, data_points } = activityDetails
  const { onSubmit } = useCompleteBookAppointment()

  const { calLink } = useMemo(
    () => mapActionFieldsToObject<BookAppointmentFields>(fields),
    [fields]
  )

  const defaults = useMemo(() => {
    const getVal = (key: string) =>
      data_points?.find((d) => d.label === key)?.value || ''
    const name = getVal('defaultName')
    const email = getVal('defaultEmail')
    const phone = getVal('defaultPhone')
    const hasAny = [name, email, phone].some((v) => v && v.length > 0)
    return hasAny
      ? {
          name: name || undefined,
          email: email || undefined,
          phone: phone || undefined,
        }
      : undefined
  }, [data_points])

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

  const calProps: any = {
    calLink,
    metadata: {
      awellPathwayId: pathway_id,
      awellActivityId: activity_id,
    },
    onBookingSuccessful,
  }
  if (defaults) {
    calProps.defaultFormValues = defaults
  }

  return <CalDotComScheduling {...calProps} />
}

BookAppointmentAction.displayName = 'BookAppointmentAction'
