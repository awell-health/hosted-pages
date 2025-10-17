import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import * as z from 'zod'
import type { ExtensionActivityRecord } from '../../../types'
import { useIntakeScheduling } from './hooks/useIntakeScheduling'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import { ActionFields, ExtensionSettings } from './types'
import {
  SchedulingActivity,
  type GetProvidersInputType,
  Gender,
  Ethnicity,
  ClinicalFocus,
  DeliveryMethod,
  LocationState,
  type SlotWithConfirmedLocation,
  TherapeuticModalitySchema,
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
import { useHostedSession } from '../../../../../hooks/useHostedSession'
import { useLogging } from '../../../../../hooks/useLogging'

interface IntakeSchedulingProps {
  activityDetails: ExtensionActivityRecord
}

export const IntakeScheduling: FC<IntakeSchedulingProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields, settings } = activityDetails
  const { session, metadata } = useHostedSession()
  const { log } = useLogging()

  const { providerId, patientName, salesforceLeadId, ...providerPrefs } =
    mapActionFieldsToObject<ActionFields>(fields)

  const initialPrefs = populateInitialPrefs(providerPrefs)

  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { onSubmit } = useIntakeScheduling()

  const [providerPreferences] = useState<GetProvidersInputType>(initialPrefs)

  const logContext = useMemo(
    () => ({
      session,
      metadata,
      fields,
      activity_id,
    }),
    [session, metadata, fields, activity_id]
  )

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
    async (providerId: string) => {
      const provider = await fetchProvider({
        input: { providerId },
        requestOptions: { baseUrl, logContext },
        log,
      })
      return provider
    },
    [baseUrl, logContext, log]
  )

  const fetchProvidersFn = useCallback(
    async (prefs: GetProvidersInputType) => {
      const providers = await fetchProviders({
        input: prefs,
        requestOptions: { baseUrl, logContext },
        log,
      })
      return providers
    },
    [baseUrl, logContext, log]
  )

  const fetchAvailabilityFn = useCallback(
    (_providerId: string) => {
      return fetchAvailability({
        input: {
          providerId: [_providerId],
        },
        requestOptions: { baseUrl, logContext },
        log,
      })
    },
    [baseUrl, logContext, log]
  )

  const bookAppointmentFn = useCallback(
    (_slot: SlotWithConfirmedLocation) => {
      return bookAppointment({
        input: {
          eventId: _slot.eventId,
          providerId: _slot.providerId,
          userInfo: {
            userName: patientName,
            ...(salesforceLeadId && { salesforceLeadId }),
          },
          locationType: _slot.confirmedLocation,
        },
        requestOptions: { baseUrl, logContext },
        log,
      })
    },
    [patientName, salesforceLeadId, baseUrl, logContext, log]
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
    insurance: providerPrefs.insurancePreference as string | undefined,
    gender: providerPrefs.genderPreference as Gender,
    ethnicity: providerPrefs.ethnicityPreference as Ethnicity,
    therapeuticModality: providerPrefs.therapeuticModalityPreference as z.infer<
      typeof TherapeuticModalitySchema
    >,
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
      facility: undefined,
    },
  }
}
