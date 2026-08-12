import { beforeEach, describe, expect, it, vi } from 'vitest'
import { JwtFeature } from './jwt-feature'

const { sentryLogger, captureHostedSessionError } = vi.hoisted(() => ({
  sentryLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
  captureHostedSessionError: vi.fn(),
}))

vi.mock('@sentry/nextjs', () => ({ logger: sentryLogger }))
vi.mock('../src/utils/errors', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../src/utils/errors')>()
  return {
    ...actual,
    captureHostedSessionError,
  }
})
vi.mock('../types', () => ({
  environment: {
    apiGatewayConsumerName: 'test-consumer',
    jwtAuthSecret: 'test-secret',
    jwtAuthKey: 'test-key',
    orchestrationApiUrl: 'https://api.test/graphql',
  },
}))

import jwt from 'jsonwebtoken'
import { startHostedPathwaySession } from './startHostedPathwaySession'

type GraphQLBody = {
  variables: {
    input: {
      id: string
      patient_identifier?: { system: string; value: string }
      tracking?: Record<string, unknown>
    }
  }
}

const mockFetchSuccess = (
  session_url: string,
  organization_slug = 'acme-clinic'
) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          data: {
            startHostedPathwaySessionFromLink: {
              session_url,
              organization_slug,
            },
          },
        }),
    })
  )
}

const getMutationInput = (): GraphQLBody['variables']['input'] => {
  const fetchMock = vi.mocked(fetch)
  const [, init] = fetchMock.mock.calls[0]
  const body = JSON.parse(init?.body as string) as GraphQLBody
  return body.variables.input
}

describe('startHostedPathwaySession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts an anonymous session when patient_identifier is omitted', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    const result = await startHostedPathwaySession({
      hostedPagesLinkId: 'link-123',
    })

    expect(result).toEqual({
      sessionUrl: 'https://goto.test/?sessionId=sess-1',
      organization_slug: 'acme-clinic',
    })
    expect(getMutationInput()).toEqual({ id: 'link-123' })
  })

  it('decodes patient_identifier into system and value for the mutation', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    await startHostedPathwaySession({
      hostedPagesLinkId: 'link-123',
      patient_identifier: 'https%3A%2F%2Ffhir.example%7Cpatient-42',
    })

    expect(getMutationInput()).toEqual({
      id: 'link-123',
      patient_identifier: {
        system: 'https://fhir.example',
        value: 'patient-42',
      },
    })
  })

  it('treats the literal string "undefined" as no patient identifier', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    await startHostedPathwaySession({
      hostedPagesLinkId: 'link-123',
      patient_identifier: 'undefined',
    })

    expect(getMutationInput()).toEqual({ id: 'link-123' })
  })

  it('forwards tracking input to the mutation', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    await startHostedPathwaySession({
      hostedPagesLinkId: 'link-123',
      tracking: {
        utm_source: 'email',
        custom: { referral_code: 'abc' },
      },
    })

    expect(getMutationInput()).toEqual({
      id: 'link-123',
      tracking: {
        utm_source: 'email',
        custom: { referral_code: 'abc' },
      },
    })
  })

  it('appends deep-link and polling params to the session URL', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    const result = await startHostedPathwaySession({
      hostedPagesLinkId: 'link-123',
      activity_id: 'activity-1',
      track_id: 'track-1',
      pollingTimeout: '30000',
    })

    expect(result).toMatchObject({
      sessionUrl:
        'https://goto.test/?sessionId=sess-1&activity_id=activity-1&pollingTimeout=30000',
    })
  })

  it('prefers activity_id over track_id when both are present', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    const result = await startHostedPathwaySession({
      hostedPagesLinkId: 'link-123',
      activity_id: 'activity-1',
      track_id: 'track-1',
    })

    expect(result).toMatchObject({
      sessionUrl: 'https://goto.test/?sessionId=sess-1&activity_id=activity-1',
    })
  })

  it('signs a hosted-pathway JWT for the link id', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    await startHostedPathwaySession({
      hostedPagesLinkId: 'link-123',
    })

    const fetchMock = vi.mocked(fetch)
    const [, init] = fetchMock.mock.calls[0]
    const token = (
      init?.headers as Record<string, string>
    ).authorization.replace('Bearer ', '')

    expect(jwt.verify(token, 'test-secret')).toMatchObject({
      username: 'test-consumer',
      feature: JwtFeature.HostedPathwayLink,
      iss: 'test-key',
      sub: 'link-123',
    })
  })

  it('returns GraphQL errors without throwing', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            data: {
              startHostedPathwaySessionFromLink: {
                organization_slug: 'acme-clinic',
              },
            },
            errors: [
              {
                message: 'Patient not found',
                extensions: { data: { message: 'Patient not found' } },
              },
            ],
          }),
      })
    )

    const result = await startHostedPathwaySession({
      hostedPagesLinkId: 'link-123',
      patient_identifier: 'https://fhir.example|missing',
    })

    expect(result).toEqual({ error: 'Patient not found' })
    expect(captureHostedSessionError).toHaveBeenCalledTimes(1)
    expect(sentryLogger.error).toHaveBeenCalledWith(
      'Error with hosted pathway link',
      expect.objectContaining({
        patient_identifier: 'https://fhir.example|missing',
      })
    )
  })

  it('returns an error when session_url is missing from the response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        json: () =>
          Promise.resolve({
            data: {
              startHostedPathwaySessionFromLink: {
                organization_slug: 'acme-clinic',
              },
            },
          }),
      })
    )

    const result = await startHostedPathwaySession({
      hostedPagesLinkId: 'link-123',
    })

    expect(result).toEqual({
      error: 'Session URL is missing from GraphQL response',
    })
    expect(captureHostedSessionError).toHaveBeenCalledTimes(1)
  })
})
