/* eslint-disable no-unused-vars */
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
  const [providerPreferences, setProviderPreferences] = useState<{
    age?: string
    gender?: string | undefined
    ethnicity?: string | undefined
    clinicalFocus?: string[] | undefined
    deliveryMethod?: string | undefined
    locationState?: string | undefined
    therapeuticModality?: string | undefined
  }>({
    age: undefined,
    gender: undefined,
    ethnicity: undefined,
    clinicalFocus: undefined,
    deliveryMethod: undefined,
    locationState: undefined,
    therapeuticModality: undefined,
  })

  const { activity_id, fields } = activityDetails
  const { onSubmit } = useIntakeScheduling()

  const {
    providerId,
    patientName,
    age,
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
  })

  useEffect(() => {
    // Set the initial provider preferences from the mapped fields
    setProviderPreferences({
      age: age ? String(age) : undefined,
      gender: genderPreference,
      ethnicity: ethnicityPreference,
      clinicalFocus: clinicalFocusPreference?.split(','),
      therapeuticModality: therapeuticModalityPreference,
      locationState: locationStatePreference,
    })
  }, [
    age,
    genderPreference,
    ethnicityPreference,
    clinicalFocusPreference,
    therapeuticModalityPreference,
    locationStatePreference,
  ])

  const handleProviderPreferencesChange = useCallback(
    (key: string, value: any) => {
      setProviderPreferences((prev) => ({
        ...prev,
        [key]: value,
      }))
    },
    []
  )

  const fetchProvidersFn = useCallback(
    () =>
      fetchProviders({
        age: age ? String(age) : undefined,
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
      age,
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
        providerId: _slot.providerId,
        slotDate: _slot.slotstart.toISOString(),
        slotDateOnlyLocaleString: _slot.slotstart.toLocaleDateString(),
        slotTimeOnlyLocaleString: _slot.slotstart.toLocaleTimeString(),
      })
    },
    [activity_id, onSubmit, providerId]
  )

  return (
    <SchedulingActivity
      providerId={providerId}
      timeZone={timeZone}
      onProviderSelect={(id: string) => setProvider(id)}
      onDateSelect={(date: Date) => setDate(date)}
      onSlotSelect={(slot: SlotType) => setSlot(slot)}
      onBooking={bookAppointmentFn}
      fetchProviders={fetchProvidersFn}
      fetchAvailability={fetchAvailabilityFn}
      onCompleteActivity={completeActivity}
      opts={{
        allowSchedulingInThePast: false,
      }}
      providerPreferences={providerPreferences}
      onProviderPreferencesChange={handleProviderPreferencesChange}
    />
  )
}

IntakeScheduling.displayName = 'IntakeScheduling'
