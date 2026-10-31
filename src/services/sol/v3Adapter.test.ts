import { describe, expect, test } from 'vitest'
import {
  GetAvailabilitiesResponseSchema,
  GetProviderResponseSchema,
  GetProvidersResponseSchema,
  type GetProvidersInputType,
} from '@awell-health/sol-scheduling'
import {
  fromV3AvailabilityResponse,
  fromV3BookingResponse,
  fromV3ProviderResponse,
  fromV3ProviderSearchResponse,
  toV3AvailabilityQuery,
  toV3BookingBody,
  toV3ProviderSearchQuery,
  type V3AvailabilityResponse,
  type V3ProviderResponse,
  type V3ProviderSearchResponse,
} from './v3Adapter'

/**
 * Fixtures are the live production captures from SOL's
 * "Smart Scheduling API Migration Guide: AWELL" (29 October 2026).
 */
const providerSearchFixture: V3ProviderSearchResponse = {
  data: [
    {
      id: '34735',
      firstName: 'Kate',
      lastName: 'Parker',
      name: 'Kate Parker',
      bio: 'I specialize in trauma-informed care, crisis stabilization, and suppor ...',
      imageUrl: 'https://media.solmentalhealth.com/content/Katelyn_Parker.png',
      profileLink: 'https://www.solmentalhealth.com/providers/katelyn-parker',
      location: { facility: 'CO - Castle Rock' },
      events: [
        {
          eventId: '02E923F7-0FF7-4337-B6E3-C49629CB41F9',
          date: '2026-10-29',
          slotStart: '2026-10-29T18:00:00Z',
          duration: 60,
          booked: false,
          locationType: 'In-Person',
          facility: 'CO - Castle Rock',
        },
        {
          eventId: '97922435-F1F8-4ABB-BD24-B522DBBAC48C',
          date: '2026-10-29',
          slotStart: '2026-10-29T20:00:00Z',
          duration: 60,
          booked: false,
          locationType: 'In-Person',
          facility: 'CO - Castle Rock',
        },
      ],
    },
  ],
  errorMessage: '',
  errorCode: '',
}

const availabilityFixture: V3AvailabilityResponse = {
  data: {
    '34735': [
      {
        eventId: '02E923F7-0FF7-4337-B6E3-C49629CB41F9',
        providerId: '34735',
        date: '2026-10-29',
        slotStart: '2026-10-29T18:00:00Z',
        duration: 60,
        booked: false,
        locationType: 'In-Person',
        facility: 'CO - Castle Rock',
        inPersonFacility: 'CO - Castle Rock',
        virtualFacility: 'CO (Statewide)',
      },
      {
        eventId: '97922435-F1F8-4ABB-BD24-B522DBBAC48C',
        providerId: '34735',
        date: '2026-10-29',
        slotStart: '2026-10-29T20:00:00Z',
        duration: 60,
        booked: false,
        locationType: 'Telehealth',
        facility: 'CO - Castle Rock',
        virtualFacility: 'CO (Statewide)',
      },
    ],
  },
  errorMessage: '',
  errorCode: '',
}

const providerFixture: V3ProviderResponse = {
  data: {
    id: '34735',
    firstName: 'Kate',
    lastName: 'Parker',
    name: 'Kate Parker',
    bio: 'I specialize in trauma-informed care, crisis stabilization, and suppor ...',
    imageUrl: 'https://media.solmentalhealth.com/content/Katelyn_Parker.png',
    profileLink: 'https://www.solmentalhealth.com/providers/katelyn-parker',
    location: { facility: 'CO - Castle Rock' },
  },
  errorMessage: '',
  errorCode: '',
}

describe('toV3ProviderSearchQuery', () => {
  test('flattens location and repeats clinicalFocus, percent-encoded', () => {
    const input = {
      therapeuticModality: 'Therapy',
      deliveryMethod: 'Telehealth',
      location: { state: 'CO', facility: undefined },
      clinicalFocus: ['Anxiety d/o', 'Trauma (including PTSD)'],
      age: '34',
      insurance: 'Aetna',
    } as unknown as GetProvidersInputType

    expect(toV3ProviderSearchQuery(input)).toBe(
      'therapeuticModality=Therapy&state=CO&age=34&clinicalFocus=Anxiety%20d%2Fo&clinicalFocus=Trauma%20(including%20PTSD)&deliveryMethod=Telehealth&insurance=Aetna'
    )
  })

  test('skips undefined and empty values', () => {
    const input = {
      therapeuticModality: 'Psychiatric',
      location: { state: 'CO', facility: '' },
      gender: undefined,
      clinicalFocus: [],
    } as unknown as GetProvidersInputType

    expect(toV3ProviderSearchQuery(input)).toBe(
      'therapeuticModality=Psychiatric&state=CO'
    )
  })
})

describe('toV3AvailabilityQuery', () => {
  test('repeats providerIds once per id', () => {
    expect(toV3AvailabilityQuery(['34735', '36599'])).toBe(
      'providerIds=34735&providerIds=36599'
    )
  })
})

describe('toV3BookingBody', () => {
  test('flattens userInfo and adds bookingSource', () => {
    expect(
      toV3BookingBody({
        eventId: '02E923F7-0FF7-4337-B6E3-C49629CB41F9',
        providerId: '34735',
        userInfo: { userName: 'Test Patient', salesforceLeadId: '00Q123' },
        locationType: 'In-Person',
      })
    ).toEqual({
      eventId: '02E923F7-0FF7-4337-B6E3-C49629CB41F9',
      providerId: '34735',
      locationType: 'In-Person',
      userName: 'Test Patient',
      salesforceLeadId: '00Q123',
      bookingSource: 'Awell',
    })
  })

  test('omits salesforceLeadId when absent', () => {
    const body = toV3BookingBody({
      eventId: 'x',
      providerId: '34735',
      userInfo: { userName: 'Test Patient' },
      locationType: 'Telehealth',
    })

    expect(body).not.toHaveProperty('salesforceLeadId')
    expect(body).not.toHaveProperty('userInfo')
  })
})

describe('fromV3ProviderSearchResponse', () => {
  test('produces the legacy shape the booking UI package validates', () => {
    const legacy = fromV3ProviderSearchResponse(providerSearchFixture)

    const parsed = GetProvidersResponseSchema.safeParse(legacy)
    expect(parsed.success, JSON.stringify(parsed)).toBe(true)

    const provider = legacy.data[0]
    expect(provider.image).toBe(
      'https://media.solmentalhealth.com/content/Katelyn_Parker.png'
    )
    expect(provider.location).toEqual({ facility: 'CO - Castle Rock' })
    expect(provider.events[0]).toEqual({
      eventId: '02E923F7-0FF7-4337-B6E3-C49629CB41F9',
      providerId: '34735',
      date: '2026-10-29',
      slotstart: '2026-10-29T18:00:00Z',
      duration: 60,
      facility: 'CO - Castle Rock',
      eventType: 'In-Person',
      location: 'In-Person',
      booked: false,
      inPersonFacility: undefined,
      virtualFacility: undefined,
    })
  })

  test('returns an empty list when nothing matches', () => {
    const legacy = fromV3ProviderSearchResponse({
      data: [],
      errorMessage: '',
      errorCode: '',
    })

    expect(legacy).toEqual({ data: [], errorMessage: '', errorCode: '' })
    expect(GetProvidersResponseSchema.safeParse(legacy).success).toBe(true)
  })

  test('tolerates omitted optional fields', () => {
    const legacy = fromV3ProviderSearchResponse({
      data: [
        {
          id: '1',
          events: [
            {
              eventId: 'e1',
              booked: false,
              locationType: 'Telehealth',
              slotStart: '2026-11-01T15:00:00Z',
            },
          ],
        },
      ],
      errorMessage: '',
      errorCode: '',
    })

    expect(legacy.data[0].events[0]).toMatchObject({
      providerId: '1',
      date: '2026-11-01',
      duration: 0,
      facility: '',
    })
    expect(GetProvidersResponseSchema.safeParse(legacy).success).toBe(true)
  })
})

describe('fromV3AvailabilityResponse', () => {
  test('produces the legacy shape the booking UI package validates', () => {
    const legacy = fromV3AvailabilityResponse(availabilityFixture)

    const parsed = GetAvailabilitiesResponseSchema.safeParse(legacy)
    expect(parsed.success, JSON.stringify(parsed)).toBe(true)

    expect(Object.keys(legacy.data)).toEqual(['34735'])
    expect(legacy.data['34735'][0]).toEqual({
      eventId: '02E923F7-0FF7-4337-B6E3-C49629CB41F9',
      providerId: '34735',
      date: '2026-10-29',
      slotstart: '2026-10-29T18:00:00Z',
      duration: 60,
      facility: 'CO - Castle Rock',
      eventType: 'In-Person',
      location: 'In-Person',
      booked: false,
      inPersonFacility: 'CO - Castle Rock',
      virtualFacility: 'CO (Statewide)',
    })
    // the booking UI shows "Virtual" when `location` is Telehealth
    expect(legacy.data['34735'][1].location).toBe('Telehealth')
  })

  test('keeps a provider with no open slots as an empty list', () => {
    const legacy = fromV3AvailabilityResponse({
      data: { '34735': [] },
      errorMessage: '',
      errorCode: '',
    })

    expect(legacy.data).toEqual({ '34735': [] })
  })
})

describe('fromV3ProviderResponse', () => {
  test('produces the legacy shape the booking UI package validates', () => {
    const legacy = fromV3ProviderResponse(providerFixture)

    const parsed = GetProviderResponseSchema.safeParse(legacy)
    expect(parsed.success, JSON.stringify(parsed)).toBe(true)
    expect(legacy.data).toEqual({
      id: '34735',
      name: 'Kate Parker',
      firstName: 'Kate',
      lastName: 'Parker',
      bio: 'I specialize in trauma-informed care, crisis stabilization, and suppor ...',
      image: 'https://media.solmentalhealth.com/content/Katelyn_Parker.png',
      profileLink: 'https://www.solmentalhealth.com/providers/katelyn-parker',
      location: { facility: 'CO - Castle Rock' },
    })
  })

  test('defaults a missing location to an empty object', () => {
    const legacy = fromV3ProviderResponse({
      data: { id: '1' },
      errorMessage: '',
      errorCode: '',
    })

    expect(legacy.data.location).toEqual({})
    expect(GetProviderResponseSchema.safeParse(legacy).success).toBe(true)
  })
})

describe('fromV3BookingResponse', () => {
  test('passes the v3 envelope through', () => {
    expect(
      fromV3BookingResponse({
        data: { appointmentId: '02E923F7-0FF7-4337-B6E3-C49629CB41F9' },
        errorMessage: '',
        errorCode: '',
      })
    ).toEqual({
      data: { appointmentId: '02E923F7-0FF7-4337-B6E3-C49629CB41F9' },
      errorMessage: '',
      errorCode: '',
    })
  })
})
