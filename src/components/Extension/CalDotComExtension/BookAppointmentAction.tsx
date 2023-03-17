import React, { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'next-i18next'
import { CalDotComScheduling } from '@awell_health/ui-library'
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
  const { t } = useTranslation()
  const { activity_id, fields } = activityDetails
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

  return (
    <CalDotComScheduling
      calLink={calLink}
      onBookingSuccessful={onBookingSuccessful}
    />
  )
}

BookAppointmentAction.displayName = 'BookAppointmentAction'
