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
import '@awell-health/sol-scheduling/style.css'

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
        /**
         * Although it's an array of strings,
         * we receive it as comma-separated string in hosted pages
         */
        clinicalFocus: clinicalFocusPreference.split(',') as (
          | 'Panic Disorder'
          | 'Acute Stress'
          | 'Generalized Anxiety'
        )[],
        deliveryMethod: deliveryMethodPreference,
        location: {
          facility: locationFacilityPreference,
          state: locationStatePreference,
        },
      }),
    [
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
    ]
  )

  const fetchAvailabilityFn = useCallback(() => {
    if (!provider)
      throw new Error('No provider selected to fetch availabilities for')

    return fetchAvailability({
      providerId: [provider],
    })
  }, [provider])

  const bookAppointmentFn = useCallback(() => {
    if (!slot) throw new Error('No slot was selected')

    return bookAppointment({
      eventId: slot.eventId,
      userInfo: {
        userName: patientName,
        userEmail: patientEmail,
      },
    })
  }, [slot, patientName, patientEmail])

  const completeActivity = useCallback(() => {
    if (!slot) throw new Error('No slot was selected')

    onSubmit({
      activityId: activity_id,
      eventId: slot.eventId,
      date: slot.startDate,
    })
  }, [activity_id, onSubmit, slot, activity_id])

  return (
    <SchedulingActivity
      onProviderSelect={(id) => setProvider(id)}
      onDateSelect={(date) => setDate(date)}
      onSlotSelect={(slot) => setSlot(slot)}
      onBooking={bookAppointmentFn}
      fetchProviders={fetchProvidersFn}
      fetchAvailability={fetchAvailabilityFn}
      onCompleteActivity={completeActivity}
    />
  )
}

IntakeScheduling.displayName = 'IntakeScheduling'
