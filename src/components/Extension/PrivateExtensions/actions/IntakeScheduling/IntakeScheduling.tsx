import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import type { ExtensionActivityRecord } from '../../../types'
import { useIntakeScheduling } from './hooks/useIntakeScheduling'
import { mapActionFieldsToObject } from '../../../utils'
import { ActionFields } from './types'
import {
  type SlotType,
  SchedulingActivity,
  GetProvidersInputType,
  Gender,
  Ethnicity,
  Modality,
  ClinicalFocus,
  DeliveryMethod,
  LocationState,
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

const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone

export const IntakeScheduling: FC<IntakeSchedulingProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { providerId, patientName, ...providerPrefs } =
    mapActionFieldsToObject<ActionFields>(fields)
  const initialPrefs = populateInitialPrefs(providerPrefs)

  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { onSubmit } = useIntakeScheduling()

  const [provider, setProvider] = useState<string | undefined>(undefined)
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [slot, setSlot] = useState<SlotType | undefined>(undefined)

  const [providerPreferences, setProviderPreferences] =
    useState<GetProvidersInputType>(initialPrefs)

  useEffect(() => {
    updateLayoutMode('flexible')

    return () => {
      // Reset to default mode on unmount
      resetLayoutMode()
    }
  }, [])

  useEffect(() => {
    fetchProvidersFn(providerPreferences)
  }, [providerPreferences])

  const fetchProvidersFn = useCallback(
    (prefs: GetProvidersInputType) => fetchProviders(prefs),
    [providerPreferences]
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
      providerPreferences={providerPreferences}
      onProviderPreferencesChange={(preferences: GetProvidersInputType) => {
        setProviderPreferences(preferences)
      }}
    />
  )
}

IntakeScheduling.displayName = 'IntakeScheduling'

const populateInitialPrefs = (
  providerPrefs: Omit<ActionFields, 'patientName' | 'providerId'>
) => {
  return {
    age: providerPrefs.agePreference
      ? String(providerPrefs.agePreference)
      : undefined,
    gender: providerPrefs.genderPreference as Gender,
    ethnicity: providerPrefs.ethnicityPreference as Ethnicity,
    therapeuticModality:
      providerPrefs.therapeuticModalityPreference as Modality,
    /**
     * Although it's an array of strings,
     * we receive it as comma-separated string in hosted pages
     */
    clinicalFocus: providerPrefs.clinicalFocusPreference
      ? (providerPrefs.clinicalFocusPreference.split(',') as ClinicalFocus[])
      : undefined,
    deliveryMethod: providerPrefs.deliveryMethodPreference as DeliveryMethod,
    location: {
      state: providerPrefs.locationStatePreference as LocationState,
    },
  }
}
