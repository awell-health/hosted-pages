import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LogEvent } from '../../utils/logging'
import { createGraphQLRequestLifecycle } from './apollo-client'

// `Sentry.logger` is exposed through a non-configurable getter, so the module is
// replaced wholesale rather than spied on.
const { sentryLogger } = vi.hoisted(() => ({
  sentryLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

vi.mock('@sentry/nextjs', () => ({ logger: sentryLogger }))

describe('createGraphQLRequestLifecycle — teardown observability', () => {
  const warn = sentryLogger.warn

  beforeEach(() => {
    warn.mockClear()
  })

  it('names the in-flight operations it aborts', () => {
    const lifecycle = createGraphQLRequestLifecycle()
    const poll = new AbortController()
    const activities = new AbortController()

    lifecycle.trackRequest(poll, 'abort', 'GetHostedSession')
    lifecycle.trackRequest(activities, 'abort', 'GetHostedSessionActivities')

    lifecycle.cancelPendingRequests()

    expect(poll.signal.aborted).toBe(true)
    expect(activities.signal.aborted).toBe(true)
    expect(warn).toHaveBeenCalledTimes(1)

    const [message, attributes] = warn.mock.calls[0]
    expect(message).toContain('Aborted in-flight GraphQL requests')
    expect(attributes).toMatchObject({
      event_type: LogEvent.GRAPHQL_REQUESTS_ABORTED,
      aborted_request_count: 2,
      operations: ['GetHostedSession', 'GetHostedSessionActivities'],
    })
  })

  it('stays quiet when there is nothing in flight to abort', () => {
    const lifecycle = createGraphQLRequestLifecycle()

    lifecycle.cancelPendingRequests()

    expect(warn).not.toHaveBeenCalled()
  })

  it('does not report requests that already settled', () => {
    const lifecycle = createGraphQLRequestLifecycle()
    const settled = new AbortController()
    const inFlight = new AbortController()

    lifecycle.trackRequest(settled, 'abort', 'GetHostedSession')
    lifecycle.trackRequest(inFlight, 'abort', 'GetMessage')
    lifecycle.releaseRequest(settled)

    lifecycle.cancelPendingRequests()

    expect(warn.mock.calls[0][1]).toMatchObject({
      aborted_request_count: 1,
      operations: ['GetMessage'],
    })
  })

  it('rejects new requests after termination', () => {
    const lifecycle = createGraphQLRequestLifecycle()
    const late = new AbortController()

    lifecycle.cancelPendingRequests()
    lifecycle.trackRequest(late, 'abort', 'GetHostedSession')

    expect(lifecycle.isTerminated).toBe(true)
    expect(late.signal.aborted).toBe(true)
  })
})
