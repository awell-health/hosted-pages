/**
 * Adapters between SOL's Smart Scheduling API v3 and the legacy response
 * shapes that the pinned `@awell-health/sol-scheduling` booking UI validates
 * against. The package is frozen (the repo was handed over to BETSOL), so the
 * translation happens here, server-side, and the browser code is untouched.
 *
 * Field mapping comes from SOL's "Smart Scheduling API Migration Guide: AWELL"
 * (October 2026). Fields SOL marks Optional are omitted when empty, never sent
 * as "" or null, so every read below tolerates a missing key.
 */
import type {
  BookAppointmentInputType,
  GetProvidersInputType,
} from '@awell-health/sol-scheduling'

/** Value SOL requires in `bookingSource` to attribute bookings to Awell. */
export const SOL_BOOKING_SOURCE = 'Awell'

// ---------------------------------------------------------------------------
// v3 wire types (responses)
// ---------------------------------------------------------------------------

export interface V3Envelope<T> {
  data: T
  errorMessage?: string
  errorCode?: string
}

export interface V3Provider {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  bio?: string
  imageUrl?: string
  profileLink?: string
  language?: string
  ethnicity?: string
  location?: {
    facility?: string
    state?: string
  }
}

export interface V3Slot {
  eventId: string
  providerId?: string
  /** YYYY-MM-DD */
  date?: string
  /** RFC 3339, always UTC */
  slotStart?: string
  /** Minutes. Omitted when 0. */
  duration?: number
  booked?: boolean
  locationType?: string
  facility?: string
  inPersonFacility?: string
  virtualFacility?: string
  salesforceLeadId?: string
}

export type V3ProviderSearchResponse = V3Envelope<
  Array<V3Provider & { events?: V3Slot[] }>
>
export type V3AvailabilityResponse = V3Envelope<Record<string, V3Slot[]>>
export type V3ProviderResponse = V3Envelope<V3Provider>
export type V3BookingResponse = V3Envelope<{ appointmentId: string }>

// ---------------------------------------------------------------------------
// Legacy wire types (what the booking UI package expects, before Zod parsing)
// ---------------------------------------------------------------------------

export interface LegacyProvider {
  id: string
  name?: string
  firstName?: string
  lastName?: string
  bio?: string
  image?: string
  profileLink?: string
  location?: {
    facility?: string
    state?: string
  }
}

export interface LegacySlot {
  eventId: string
  providerId: string
  date?: string
  slotstart?: string
  duration: number
  facility: string
  eventType?: string
  location?: string
  booked?: boolean
  inPersonFacility?: string
  virtualFacility?: string
}

export type LegacyProviderSearchResponse = V3Envelope<
  Array<LegacyProvider & { events: LegacySlot[] }>
>
export type LegacyAvailabilityResponse = V3Envelope<
  Record<string, LegacySlot[]>
>
export type LegacyProviderResponse = V3Envelope<LegacyProvider>

// ---------------------------------------------------------------------------
// Requests
// ---------------------------------------------------------------------------

const hasValue = (value: unknown): value is string | number =>
  value !== undefined && value !== null && value !== ''

/**
 * Search providers moved from `POST /api/v2/provider` with a JSON body to
 * `GET /smartscheduling/api/v3/providers?{filters}`. `location` is split into
 * flat `state` and `facility`; `clinicalFocus` is repeated once per value.
 * Values are percent-encoded (several allowed values contain spaces or `&`).
 */
export const toV3ProviderSearchQuery = (
  input: GetProvidersInputType
): string => {
  const pairs: Array<[string, string | number]> = []
  const add = (key: string, value: unknown) => {
    if (hasValue(value)) pairs.push([key, value])
  }

  add('therapeuticModality', input.therapeuticModality)
  add('state', input.location?.state)
  add('facility', input.location?.facility)
  add('age', input.age)
  add('gender', input.gender)
  add('ethnicity', input.ethnicity)
  add('language', input.language)
  for (const focus of input.clinicalFocus ?? []) add('clinicalFocus', focus)
  add('deliveryMethod', input.deliveryMethod)
  add('timeOfTheDay', input.timeOfTheDay)
  add('insurance', input.insurance)

  return pairs
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
    )
    .join('&')
}

/**
 * Get availability moved from `POST /api/event/list` with `{ providerId: [] }`
 * to `GET /smartscheduling/api/v3/events?providerIds={id}`, one `providerIds`
 * parameter per id (a comma-separated list is rejected).
 */
export const toV3AvailabilityQuery = (providerIds: string[]): string =>
  providerIds.map((id) => `providerIds=${encodeURIComponent(id)}`).join('&')

export interface V3BookingBody {
  eventId: string
  providerId: string
  locationType: string
  userName: string
  salesforceLeadId?: string
  bookingSource: typeof SOL_BOOKING_SOURCE
}

/**
 * Book an appointment moved from `POST /api/event/book` to
 * `POST /smartscheduling/api/v3/appointments`. `userInfo` is flattened and
 * `bookingSource` is required.
 */
export const toV3BookingBody = (
  input: BookAppointmentInputType
): V3BookingBody => ({
  eventId: input.eventId,
  providerId: input.providerId,
  locationType: input.locationType,
  userName: input.userInfo.userName,
  ...(hasValue(input.userInfo.salesforceLeadId) && {
    salesforceLeadId: input.userInfo.salesforceLeadId,
  }),
  bookingSource: SOL_BOOKING_SOURCE,
})

// ---------------------------------------------------------------------------
// Responses
// ---------------------------------------------------------------------------

const envelope = <T>(body: V3Envelope<unknown>, data: T): V3Envelope<T> => ({
  data,
  errorMessage: body.errorMessage ?? '',
  errorCode: body.errorCode ?? '',
})

const fromV3Provider = (provider: V3Provider): LegacyProvider => ({
  id: provider.id,
  name: provider.name,
  firstName: provider.firstName,
  lastName: provider.lastName,
  bio: provider.bio,
  // renamed in v3
  image: provider.imageUrl,
  profileLink: provider.profileLink,
  // still an object in v3; `state` is omitted when empty, which the legacy
  // schema accepts
  location: provider.location ?? {},
})

const fromV3Slot = (slot: V3Slot, providerId: string): LegacySlot => ({
  eventId: slot.eventId,
  // removed from search results in v3 (always equal to the parent provider)
  providerId: slot.providerId ?? providerId,
  date: slot.date ?? slot.slotStart?.slice(0, 10),
  // renamed in v3
  slotstart: slot.slotStart,
  // omitted by v3 when 0; the legacy schema requires a number
  duration: slot.duration ?? 0,
  // the legacy schema requires a string
  facility: slot.facility ?? '',
  // renamed in v3
  eventType: slot.locationType,
  // the legacy `location` duplicated the location type; the booking UI reads
  // it to decide between "Virtual" and the facility name
  location: slot.locationType,
  booked: slot.booked,
  inPersonFacility: slot.inPersonFacility,
  virtualFacility: slot.virtualFacility,
})

export const fromV3ProviderSearchResponse = (
  body: V3ProviderSearchResponse
): LegacyProviderSearchResponse =>
  envelope(
    body,
    (body.data ?? []).map((provider) => ({
      ...fromV3Provider(provider),
      events: (provider.events ?? []).map((slot) =>
        fromV3Slot(slot, provider.id)
      ),
    }))
  )

export const fromV3AvailabilityResponse = (
  body: V3AvailabilityResponse
): LegacyAvailabilityResponse =>
  envelope(
    body,
    Object.fromEntries(
      Object.entries(body.data ?? {}).map(([providerId, slots]) => [
        providerId,
        (slots ?? []).map((slot) => fromV3Slot(slot, providerId)),
      ])
    )
  )

export const fromV3ProviderResponse = (
  body: V3ProviderResponse
): LegacyProviderResponse => envelope(body, fromV3Provider(body.data))

/**
 * The legacy booking response carried `data: ""`; v3 returns
 * `data: { appointmentId }`. The booking UI does not read `data`, so it is
 * passed through unchanged.
 */
export const fromV3BookingResponse = (
  body: V3BookingResponse
): V3BookingResponse => envelope(body, body.data)
