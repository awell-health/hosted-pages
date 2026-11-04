import { describe, expect, it } from 'vitest'
import { extractTrackingParams } from './extractTrackingParams'

describe('extractTrackingParams', () => {
  it('returns undefined when there are no tracking params', () => {
    expect(
      extractTrackingParams({
        hostedPagesLinkId: 'link-123',
        patient_identifier: 'https://fhir.example|patient-1',
      })
    ).toBeUndefined()
  })

  it('extracts UTM params', () => {
    expect(
      extractTrackingParams({
        utm_source: 'email',
        utm_medium: 'newsletter',
        utm_campaign: 'spring',
      })
    ).toEqual({
      utm_source: 'email',
      utm_medium: 'newsletter',
      utm_campaign: 'spring',
    })
  })

  it('puts non-system, non-UTM params into custom', () => {
    expect(
      extractTrackingParams({
        referral_code: 'abc123',
        hostedPagesLinkId: 'link-123',
      })
    ).toEqual({
      custom: { referral_code: 'abc123' },
    })
  })

  it('excludes patient_identifier from custom tracking', () => {
    expect(
      extractTrackingParams({
        patient_identifier: 'https://fhir.example|patient-1',
        utm_source: 'sms',
      })
    ).toEqual({
      utm_source: 'sms',
    })
  })

  it('excludes routing params from custom tracking', () => {
    expect(
      extractTrackingParams({
        hostedPagesLinkId: 'link-123',
        track_id: 'track-1',
        activity_id: 'activity-1',
        sessionId: 'session-1',
        locale: 'en',
        source: 'qr',
      })
    ).toEqual({
      custom: { source: 'qr' },
    })
  })

  it('ignores empty string values and array values in custom', () => {
    expect(
      extractTrackingParams({
        empty: '',
        multi: ['a', 'b'],
        kept: 'value',
      })
    ).toEqual({
      custom: { kept: 'value' },
    })
  })
})
