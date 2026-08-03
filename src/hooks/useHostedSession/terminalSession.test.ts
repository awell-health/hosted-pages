import { describe, expect, it } from 'vitest'
import { HostedSessionStatus } from '../../types/generated/types-orchestration'
import type { HostedSession } from './types'
import {
  getSessionRedirectUrl,
  isTerminalSessionStatus,
  shouldRedirectAfterSession,
} from './terminalSession'

const session = (overrides: Partial<HostedSession>): HostedSession =>
  ({
    id: 'session-1',
    pathway_id: 'pathway-1',
    status: HostedSessionStatus.Active,
    success_url: 'https://success.example',
    cancel_url: 'https://cancel.example',
    organization_slug: 'awell-dev',
    stakeholder: { id: 's1', type: 'PATIENT', name: 'Test' },
    ...overrides,
  } as HostedSession)

describe('isTerminalSessionStatus', () => {
  it.each([
    [HostedSessionStatus.Completed, true],
    [HostedSessionStatus.Expired, true],
    [HostedSessionStatus.Active, false],
    [undefined, false],
  ])('%s → %s', (status, expected) => {
    expect(isTerminalSessionStatus(status)).toBe(expected)
  })
})

describe('getSessionRedirectUrl', () => {
  it('sends a completed session to success_url', () => {
    expect(
      getSessionRedirectUrl(session({ status: HostedSessionStatus.Completed }))
    ).toBe('https://success.example')
  })

  it('sends an expired session to cancel_url', () => {
    expect(
      getSessionRedirectUrl(session({ status: HostedSessionStatus.Expired }))
    ).toBe('https://cancel.example')
  })

  it('has no destination for an active session', () => {
    expect(getSessionRedirectUrl(session({}))).toBeUndefined()
  })

  it('has no destination when the integrator supplied no url', () => {
    expect(
      getSessionRedirectUrl(
        session({ status: HostedSessionStatus.Completed, success_url: null })
      )
    ).toBeUndefined()
  })

  it('has no destination without a session', () => {
    expect(getSessionRedirectUrl(undefined)).toBeUndefined()
  })
})

describe('shouldRedirectAfterSession', () => {
  it('is true only for a terminal session with a destination', () => {
    expect(
      shouldRedirectAfterSession(
        session({ status: HostedSessionStatus.Completed })
      )
    ).toBe(true)
    expect(
      shouldRedirectAfterSession(
        session({ status: HostedSessionStatus.Completed, success_url: null })
      )
    ).toBe(false)
    expect(shouldRedirectAfterSession(session({}))).toBe(false)
    expect(shouldRedirectAfterSession(undefined)).toBe(false)
  })
})
