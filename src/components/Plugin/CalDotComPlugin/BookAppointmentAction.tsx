import React, { FC, useCallback, useMemo } from 'react'
import { useTranslation } from 'next-i18next'
import { CalDotComScheduling } from '@awell_health/ui-library'
import { mapActionFieldsToObject } from '../utils'

import { BookAppointmentFields } from './types'
import type { PluginActivityRecord } from '../../../types/generated/types-orchestration'
import type { BookingSuccessfulFunction } from '@awell_health/ui-library/dist/types/atoms/scheduling/cal.com/calDotComTypes'

interface BookAppointmentActionProps {
  activityDetails: PluginActivityRecord
}

export const BookAppointmentAction: FC<BookAppointmentActionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()
  const { fields } = activityDetails

  const { calLink } = useMemo(
    () => mapActionFieldsToObject<BookAppointmentFields>(fields),
    [fields]
  )

  const onBookingSuccessful: BookingSuccessfulFunction = useCallback((data) => {
    console.log(data)
  }, [])

  return (
    <CalDotComScheduling
      calLink={calLink}
      onBookingSuccessful={onBookingSuccessful}
    />
  )
}

BookAppointmentAction.displayName = 'BookAppointmentAction'
