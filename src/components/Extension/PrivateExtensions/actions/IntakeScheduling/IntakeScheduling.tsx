import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import type { ExtensionActivityRecord } from '../../../types'
import { useIntakeScheduling } from './hooks/useIntakeScheduling'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import { ActionFields, ExtensionSettings } from './types'
import {
  SchedulingActivity,
  type GetProvidersInputType,
  Gender,
  Ethnicity,
  Modality,
  ClinicalFocus,
  DeliveryMethod,
  LocationState,
  type SlotWithConfirmedLocation,
} from '@awell-health/sol-scheduling'
import {
  bookAppointment,
  fetchProvider,
  fetchAvailability,
  fetchProviders,
} from './api.service'
import { useTheme } from '@awell-health/ui-library'
import '@awell-health/sol-scheduling/style.css'
import { SalesforcePreferencesType } from '@awell-health/sol-scheduling/dist/lib/utils/preferences'

interface IntakeSchedulingProps {
  activityDetails: ExtensionActivityRecord
}

export const IntakeScheduling: FC<IntakeSchedulingProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields, settings } = activityDetails
  const { providerId, patientName, ...providerPrefs } =
    mapActionFieldsToObject<ActionFields>(fields)
  const initialPrefs = populateInitialPrefs(providerPrefs)

  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { onSubmit } = useIntakeScheduling()

  const [providerPreferences] = useState<GetProvidersInputType>(initialPrefs)

  const { baseUrl } = useMemo(
    () => mapSettingsToObject<ExtensionSettings>(settings),
    [settings]
  )

  useEffect(() => {
    updateLayoutMode('flexible')

    return () => {
      // Reset to default mode on unmount
      resetLayoutMode()
    }
  }, [updateLayoutMode, resetLayoutMode])

  const fetchProviderFn = useCallback(
    (providerId: string) =>
      fetchProvider({ input: { providerId }, requestOptions: { baseUrl } }),
    [baseUrl]
  )

  const fetchProvidersFn = useCallback(
    (prefs: GetProvidersInputType) =>
      fetchProviders({ input: prefs, requestOptions: { baseUrl } }),
    [baseUrl]
  )

  useEffect(() => {
    fetchProvidersFn(providerPreferences)
  }, [providerPreferences, fetchProvidersFn])

  const fetchAvailabilityFn = useCallback(
    (_providerId: string) => {
      return fetchAvailability({
        input: {
          providerId: [_providerId],
        },
        requestOptions: { baseUrl },
      })
    },
    [baseUrl]
  )

  const bookAppointmentFn = useCallback(
    (_slot: SlotWithConfirmedLocation) => {
      return bookAppointment({
        input: {
          eventId: _slot.eventId,
          providerId: _slot.providerId,
          userInfo: {
            userName: patientName,
          },
          locationType: _slot.confirmedLocation,
        },
        requestOptions: { baseUrl },
      })
    },
    [patientName, baseUrl]
  )

  const completeActivity = useCallback(
    (
      _slot: SlotWithConfirmedLocation,
      preferences: SalesforcePreferencesType
    ) => {
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
      fetchProvider={fetchProviderFn}
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
