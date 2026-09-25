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
import { startHostedActivitySession } from './startHostedActivitySession'

type GraphQLBody = {
  variables: {
    input: {
      hosted_pages_link_id: string
      tracking?: Record<string, unknown>
      track_id?: string
      activity_id?: string
    }
  }
}

const mockFetchSuccess = (
  session_url: string,
  session_id = 'sess-1',
  organization_slug = 'acme-clinic'
) => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          data: {
            startHostedActivitySessionViaHostedPagesLink: {
              session_id,
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

describe('startHostedActivitySession', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts a session from the hosted pages link id', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    const result = await startHostedActivitySession({
      hostedPagesLinkId: 'link-123',
    })

    expect(result).toEqual({
      sessionId: 'sess-1',
      sessionUrl: 'https://goto.test/?sessionId=sess-1',
      organization_slug: 'acme-clinic',
    })
    expect(getMutationInput()).toEqual({
      hosted_pages_link_id: 'link-123',
    })
  })

  it('does not send deep-link params to the mutation', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    await startHostedActivitySession({
      hostedPagesLinkId: 'link-123',
      activity_id: 'activity-1',
      track_id: 'track-1',
      pollingTimeout: '30000',
    })

    expect(getMutationInput()).toEqual({
      hosted_pages_link_id: 'link-123',
    })
  })

  it('forwards tracking input to the mutation', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    await startHostedActivitySession({
      hostedPagesLinkId: 'link-123',
      tracking: {
        utm_source: 'email',
        custom: { referral_code: 'abc' },
      },
    })

    expect(getMutationInput()).toEqual({
      hosted_pages_link_id: 'link-123',
      tracking: {
        utm_source: 'email',
        custom: { referral_code: 'abc' },
      },
    })
  })

  it('appends deep-link and polling params to the session URL', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    const result = await startHostedActivitySession({
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

    const result = await startHostedActivitySession({
      hostedPagesLinkId: 'link-123',
      activity_id: 'activity-1',
      track_id: 'track-1',
    })

    expect(result).toMatchObject({
      sessionUrl: 'https://goto.test/?sessionId=sess-1&activity_id=activity-1',
    })
  })

  it('appends track_id when activity_id is absent', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    const result = await startHostedActivitySession({
      hostedPagesLinkId: 'link-123',
      track_id: 'track-1',
    })

    expect(result).toMatchObject({
      sessionUrl: 'https://goto.test/?sessionId=sess-1&track_id=track-1',
    })
  })

  it('signs a hosted-activities JWT for the link id', async () => {
    mockFetchSuccess('https://goto.test/?sessionId=sess-1')

    await startHostedActivitySession({
      hostedPagesLinkId: 'link-123',
    })

    const fetchMock = vi.mocked(fetch)
    const [, init] = fetchMock.mock.calls[0]
    const token = (
      init?.headers as Record<string, string>
    ).authorization.replace('Bearer ', '')

    expect(jwt.verify(token, 'test-secret')).toMatchObject({
      username: 'test-consumer',
      feature: JwtFeature.HostedActivitiesLink,
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
              startHostedActivitySessionViaHostedPagesLink: {
                organization_slug: 'acme-clinic',
              },
            },
            errors: [
              {
                message: 'Care flow not active',
                extensions: { data: { message: 'Care flow not active' } },
              },
            ],
          }),
      })
    )

    const result = await startHostedActivitySession({
      hostedPagesLinkId: 'link-123',
      activity_id: 'activity-1',
    })

    expect(result).toEqual({ error: 'Care flow not active' })
    expect(captureHostedSessionError).toHaveBeenCalledTimes(1)
    expect(sentryLogger.error).toHaveBeenCalledWith(
      'Error with hosted activity link',
      expect.objectContaining({
        activity_id: 'activity-1',
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
              startHostedActivitySessionViaHostedPagesLink: {
                session_id: 'sess-1',
                organization_slug: 'acme-clinic',
              },
            },
          }),
      })
    )

    const result = await startHostedActivitySession({
      hostedPagesLinkId: 'link-123',
    })

    expect(result).toEqual({
      error: 'Session URL is missing from GraphQL response',
    })
    expect(captureHostedSessionError).toHaveBeenCalledTimes(1)
  })
})
