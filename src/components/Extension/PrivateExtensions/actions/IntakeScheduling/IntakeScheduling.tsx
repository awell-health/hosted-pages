import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import type { ExtensionActivityRecord } from '../../../types'
import { useIntakeScheduling } from './hooks/useIntakeScheduling'
import { mapActionFieldsToObject } from '../../../utils'
import { ActionFields } from './types'
import {
  GetAvailabilitiesResponseType,
  SchedulingActivity,
} from '@awell-health/sol-scheduling'
import {
  bookAppointment,
  fetchAvailability,
  fetchProviders,
} from './api.service'
import { useTheme } from '@awell-health/ui-library'

interface IntakeSchedulingProps {
  activityDetails: ExtensionActivityRecord
}

type SlotType = Pick<
  GetAvailabilitiesResponseType['data'][0],
  'startDate' | 'eventId' | 'duration'
>

export const IntakeScheduling: FC<IntakeSchedulingProps> = ({
  activityDetails,
}) => {
  const { updateLayoutMode, resetLayoutMode } = useTheme()

  const [provider, setProvider] = useState<string | undefined>(undefined)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [slot, setSlot] = useState<SlotType | undefined>(undefined)

  const { activity_id, fields } = activityDetails
  const { onSubmit } = useIntakeScheduling()

  const {
    patientName,
    patientEmail,
    agePreference,
    genderPreference,
    languagePreference,
    ethnicityPreference,
    clinicalFocusPreference,
    deliveryMethodPreference,
    locationStatePreference,
    locationFacilityPreference,
    therapeuticModalityPreference,
  } = useMemo(() => mapActionFieldsToObject<ActionFields>(fields), [fields])

  useEffect(() => {
    updateLayoutMode('flexible')

    return () => {
      // Reset to default mode on unmount
      resetLayoutMode()
    }
  }, [])

  const fetchProvidersFn = useCallback(
    () =>
      fetchProviders({
        agePreference,
        gender: genderPreference,
        ethnicity: ethnicityPreference,
        language: languagePreference,
        therapeuticModality: therapeuticModalityPreference,
        clinicalFocus: clinicalFocusPreference,
        deliveryMethod: deliveryMethodPreference,
        location: {
          facility: locationFacilityPreference,
          state: locationStatePreference,
        },
      }),
    []
  )

  const fetchAvailabilityFn = useCallback(() => {
    if (!provider)
      throw new Error('No provider seleted to fetch availabilities for')

    return fetchAvailability({
      providerId: [provider],
    })
  }, [])

  const bookAppointmentFn = useCallback(() => {
    if (!slot) throw new Error('No slot was selected')

    return bookAppointment({
      eventId: slot.eventId,
      userInfo: {
        userName: patientName,
        userEmail: patientEmail,
      },
    })
  }, [])

  const completeActivity = useCallback(() => {
    if (!slot) throw new Error('No slot was selected')

    onSubmit({
      activityId: activity_id,
      eventId: slot.eventId,
      date: slot.startDate,
    })
  }, [activity_id, onSubmit])

  return (
    <SchedulingActivity
      onProviderSelect={setProvider}
      onDateSelect={setDate}
      onSlotSelect={setSlot}
      onBooking={bookAppointmentFn}
      fetchProviders={fetchProvidersFn}
      fetchAvailability={fetchAvailabilityFn}
      onCompleteActivity={completeActivity}
    />
  )
}

IntakeScheduling.displayName = 'IntakeScheduling'
