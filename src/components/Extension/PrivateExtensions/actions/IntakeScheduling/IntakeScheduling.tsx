import React, { FC, useCallback, useEffect, useState } from 'react'

import type { ExtensionActivityRecord } from '../../../types'
import { useIntakeScheduling } from './hooks/useIntakeScheduling'
import { mapActionFieldsToObject } from '../../../utils'
import { ActionFields } from './types'
import {
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
import { SelectedSlot } from '@awell-health/sol-scheduling/dist/lib/api/schema/shared.schema'

interface IntakeSchedulingProps {
  activityDetails: ExtensionActivityRecord
}

export const IntakeScheduling: FC<IntakeSchedulingProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { providerId, patientName, ...providerPrefs } =
    mapActionFieldsToObject<ActionFields>(fields)
  const initialPrefs = populateInitialPrefs(providerPrefs)

  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { onSubmit } = useIntakeScheduling()

  const [providerPreferences] = useState<GetProvidersInputType>(initialPrefs)

  useEffect(() => {
    updateLayoutMode('flexible')

    return () => {
      // Reset to default mode on unmount
      resetLayoutMode()
    }
  }, [updateLayoutMode, resetLayoutMode])

  const fetchProvidersFn = useCallback(
    (prefs: GetProvidersInputType) => fetchProviders(prefs),
    []
  )

  useEffect(() => {
    fetchProvidersFn(providerPreferences)
  }, [providerPreferences, fetchProvidersFn])

  const fetchAvailabilityFn = useCallback((_providerId: string) => {
    return fetchAvailability({
      providerId: [_providerId],
    })
  }, [])

  const bookAppointmentFn = useCallback(
    (_slot: SelectedSlot) => {
      return bookAppointment({
        eventId: _slot.eventId,
        providerId: _slot.providerId,
        userInfo: {
          userName: patientName,
        },
        locationType: _slot.locationType,
      })
    },
    [patientName]
  )

  const completeActivity = useCallback(
    (_slot: SelectedSlot, preferences: GetProvidersInputType) => {
      onSubmit({
        activityId: activity_id,
        eventId: _slot.eventId,
        providerId: _slot.providerId,
        patientTimezone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Timezone of the environment where the code is executed (browser)
        providerPreferences: JSON.stringify(preferences),
      })
    },
    [activity_id, onSubmit]
  )

  return (
    <SchedulingActivity
      providerId={providerId}
      providerPreferences={providerPreferences}
      fetchProviders={fetchProvidersFn}
      fetchAvailability={fetchAvailabilityFn}
      onBooking={bookAppointmentFn}
      onCompleteActivity={completeActivity}
      opts={{
        allowSchedulingInThePast: false,
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
