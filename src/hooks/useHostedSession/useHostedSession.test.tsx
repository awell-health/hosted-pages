/**
 * Regression tests for the session-completion deadlock.
 *
 * Failure being pinned down (Checkly `[production-us] app-hosted-pages -
 * walkthrough`, session GpQ2OeoFxwm9, 2026-08-03 09:14 UTC): the
 * `sessionCompleted` websocket frame landed while a `GetHostedSession` poll was
 * in flight. `handleTerminalSession` aborted that poll, Apollo parked the query
 * observable on the cancellation, and — because `isTerminated` blocks every
 * later request — the hook served the pre-completion ACTIVE session forever.
 * `shouldRedirect` stayed false, so hosted pages never redirected to
 * `success_url` and the page sat on the activities skeleton.
 */
import { act, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  buildHostedSessionQueryData,
  buildSession,
  CANCEL_URL,
  renderHostedSession,
  SESSION_ID,
  SUCCESS_URL,
} from '../../../test/hostedSessionHarness'
import { HostedSessionStatus } from '../../types/generated/types-orchestration'
import { shouldRedirectAfterSession } from './terminalSession'

const POLL_INTERVAL_MS = 20

/** Mounts the hook and drives it to a polling ACTIVE session, as the walkthrough does. */
const arrangeActiveSessionWithPollInFlight = async () => {
  const harness = renderHostedSession()
  const { fetchController } = harness

  await waitFor(() =>
    expect(fetchController.pendingFor('GetHostedSession')).toHaveLength(1)
  )
  await act(async () => {
    fetchController.pendingFor('GetHostedSession')[0].resolve({
      data: buildHostedSessionQueryData(HostedSessionStatus.Active),
    })
  })
  await waitFor(() =>
    expect(harness.current().session?.status).toBe(HostedSessionStatus.Active)
  )

  // pages/index.tsx registers this poll for as long as the session is active.
  act(() => {
    harness.current().startPolling(POLL_INTERVAL_MS)
  })

  // The harness never settles a request on its own, so once a poll has been
  // issued it is deterministically in flight.
  await waitFor(() =>
    expect(
      fetchController.pendingFor('GetHostedSession').length
    ).toBeGreaterThan(0)
  )

  return {
    harness,
    inFlightPoll: fetchController.pendingFor('GetHostedSession')[0],
  }
}

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}

describe('useHostedSession — terminal frame arrives while a poll is in flight', () => {
  it('surfaces the completed session and redirects even though the poll was aborted', async () => {
    const { harness, inFlightPoll } =
      await arrangeActiveSessionWithPollInFlight()

    await act(async () => {
      harness.subscriptionController.emit('OnHostedSessionCompleted', {
        sessionCompleted: buildSession(HostedSessionStatus.Completed),
      })
    })
    await flush()

    // Preconditions: this is genuinely the deadlock scenario, not a happy path.
    expect(inFlightPoll.isAborted()).toBe(true)
    expect(harness.requestLifecycle.isTerminated).toBe(true)

    const result = harness.current()
    expect(result.loading).toBe(false)
    expect(result.error).toBeUndefined()
    expect(result.session?.status).toBe(HostedSessionStatus.Completed)
    expect(result.session?.id).toBe(SESSION_ID)
    expect(result.session?.success_url).toBe(SUCCESS_URL)

    // The condition pages/index.tsx uses to fire redirectAfterSession().
    expect(shouldRedirectAfterSession(result.session)).toBe(true)
  })

  it('does not issue further requests once the session is terminal', async () => {
    const { harness } = await arrangeActiveSessionWithPollInFlight()
    const requestsBefore = harness.fetchController.requests.length

    await act(async () => {
      harness.subscriptionController.emit('OnHostedSessionCompleted', {
        sessionCompleted: buildSession(HostedSessionStatus.Completed),
      })
    })
    await flush()

    // Teardown is a one-way door by design; the fix must not reopen it.
    expect(harness.fetchController.requests.length).toBe(requestsBefore)
    expect(harness.current().session?.status).toBe(
      HostedSessionStatus.Completed
    )
  })

  it('surfaces an expired session and redirects to cancel_url', async () => {
    const { harness, inFlightPoll } =
      await arrangeActiveSessionWithPollInFlight()

    await act(async () => {
      harness.subscriptionController.emit('OnHostedSessionExpired', {
        sessionExpired: buildSession(HostedSessionStatus.Expired),
      })
    })
    await flush()

    expect(inFlightPoll.isAborted()).toBe(true)

    const result = harness.current()
    expect(result.loading).toBe(false)
    expect(result.session?.status).toBe(HostedSessionStatus.Expired)
    expect(result.session?.cancel_url).toBe(CANCEL_URL)
    expect(shouldRedirectAfterSession(result.session)).toBe(true)
  })

  it('keeps branding and theme from the query after the poll is aborted', async () => {
    const { harness } = await arrangeActiveSessionWithPollInFlight()

    await act(async () => {
      harness.subscriptionController.emit('OnHostedSessionCompleted', {
        sessionCompleted: buildSession(HostedSessionStatus.Completed),
      })
    })
    await flush()

    const result = harness.current()
    expect(result.branding?.accent_color).toBe('#004ac2')
    expect(result.theme).toBeDefined()
  })

  it('writes the terminal session to the cache before teardown closes the client', async () => {
    const { harness } = await arrangeActiveSessionWithPollInFlight()

    await act(async () => {
      harness.subscriptionController.emit('OnHostedSessionCompleted', {
        sessionCompleted: buildSession(HostedSessionStatus.Completed),
      })
    })
    await flush()

    expect(harness.readCachedStatus()).toBe(HostedSessionStatus.Completed)
  })
})

describe('useHostedSession — happy paths must be unaffected', () => {
  it('reports loading until the initial query resolves', async () => {
    const harness = renderHostedSession()

    expect(harness.current().loading).toBe(true)
    expect(harness.current().session).toBeUndefined()

    await waitFor(() =>
      expect(
        harness.fetchController.pendingFor('GetHostedSession')
      ).toHaveLength(1)
    )
    await act(async () => {
      harness.fetchController.pendingFor('GetHostedSession')[0].resolve({
        data: buildHostedSessionQueryData(HostedSessionStatus.Active),
      })
    })

    await waitFor(() => expect(harness.current().loading).toBe(false))
    expect(harness.current().session?.status).toBe(HostedSessionStatus.Active)
    expect(shouldRedirectAfterSession(harness.current().session)).toBe(false)
  })

  it('completes via the poll path when no subscription frame arrives', async () => {
    const { harness, inFlightPoll } =
      await arrangeActiveSessionWithPollInFlight()

    // The poll itself returns COMPLETED — the ordinary case, no abort involved.
    await act(async () => {
      inFlightPoll.resolve({
        data: buildHostedSessionQueryData(HostedSessionStatus.Completed),
      })
    })
    await flush()

    await waitFor(() =>
      expect(harness.current().session?.status).toBe(
        HostedSessionStatus.Completed
      )
    )
    expect(harness.current().loading).toBe(false)
    expect(shouldRedirectAfterSession(harness.current().session)).toBe(true)
    expect(harness.requestLifecycle.isTerminated).toBe(true)
  })
})
