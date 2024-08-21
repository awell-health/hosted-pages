import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import type { ExtensionActivityRecord } from '../../../types'
import { useIntakeScheduling } from './hooks/useIntakeScheduling'
import { mapActionFieldsToObject } from '../../../utils'
import { ActionFields } from './types'
import { type SlotType, SchedulingActivity } from '@awell-health/sol-scheduling'
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

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

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
    agePreference,
    genderPreference,
    ethnicityPreference,
    clinicalFocusPreference,
    deliveryMethodPreference,
    locationStatePreference,
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
        age: agePreference ? String(agePreference) : undefined,
        gender: genderPreference,
        ethnicity: ethnicityPreference,
        therapeuticModality: therapeuticModalityPreference,
        /**
         * Although it's an array of strings,
         * we receive it as comma-separated string in hosted pages
         */
        clinicalFocus: clinicalFocusPreference
          ? (clinicalFocusPreference.split(',') as (
              | 'ADHD'
              | 'Anxiety d/o'
              | 'Autism spectrum'
              | 'Gender dysphoria'
              | 'Trauma (including PTSD)'
              | 'Depressive d/o'
              | 'Bipolar spectrum'
              | 'Anger management'
              | 'OCD'
              | 'Personality d/o'
              | 'Substance use'
              | 'Eating d/o'
              | 'Psychosis (e.g. schizophrenia)'
              | 'Dissociative d/o'
              | 'Developmental delay'
              | 'Traumatic brain injury'
            )[])
          : undefined,
        deliveryMethod: deliveryMethodPreference,
        location: {
          state: locationStatePreference,
        },
      }),
    [
      patientName,
      agePreference,
      genderPreference,
      ethnicityPreference,
      clinicalFocusPreference,
      deliveryMethodPreference,
      locationStatePreference,
      therapeuticModalityPreference,
    ]
  )

  const fetchAvailabilityFn = useCallback((_providerId: string) => {
    return fetchAvailability({
      providerId: [_providerId],
    })
  }, [])

  const bookAppointmentFn = useCallback((_slot: SlotType) => {
    return bookAppointment({
      eventId: _slot.eventId,
      providerId: _slot.providerId,
      userInfo: {
        userName: patientName,
      },
    })
  }, [])

  const completeActivity = useCallback(
    (_slot: SlotType) => {
      onSubmit({
        activityId: activity_id,
        eventId: _slot.eventId,
        date: _slot.slotstart,
      })
    },
    [activity_id, onSubmit]
  )

  return (
    <SchedulingActivity
      timeZone={timeZone}
      onProviderSelect={(id) => setProvider(id)}
      onDateSelect={(date) => setDate(date)}
      onSlotSelect={(slot) => setSlot(slot)}
      onBooking={bookAppointmentFn}
      fetchProviders={fetchProvidersFn}
      fetchAvailability={fetchAvailabilityFn}
      onCompleteActivity={completeActivity}
      opts={{
        allowSchedulingInThePast: false,
      }}
    />
  )
}

IntakeScheduling.displayName = 'IntakeScheduling'
