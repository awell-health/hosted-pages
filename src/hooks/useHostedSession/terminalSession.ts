import { isNil } from 'lodash'
import { HostedSessionStatus } from '../../types/generated/types-orchestration'
import type { HostedSession } from './types'

/**
 * A session status from which the session can never leave. Terminal statuses are
 * special throughout the app: they stop polling, close the Apollo client to new
 * requests, and trigger the redirect back to the integrator.
 */
export const isTerminalSessionStatus = (
  status: HostedSessionStatus | undefined
): boolean =>
  status === HostedSessionStatus.Completed ||
  status === HostedSessionStatus.Expired

/**
 * The URL the patient is sent to once the session reaches a terminal status, or
 * `undefined` when the session is not terminal or the integrator did not provide
 * one (in which case the terminal page is shown without redirecting).
 */
export const getSessionRedirectUrl = (
  session: HostedSession | undefined
): string | undefined => {
  if (session?.status === HostedSessionStatus.Completed) {
    return isNil(session.success_url) ? undefined : session.success_url
  }
  if (session?.status === HostedSessionStatus.Expired) {
    return isNil(session.cancel_url) ? undefined : session.cancel_url
  }
  return undefined
}

/**
 * Whether the page should redirect away from hosted pages for this session.
 * Extracted from pages/index.tsx so the redirect condition can be asserted in
 * tests against the same predicate production uses.
 */
export const shouldRedirectAfterSession = (
  session: HostedSession | undefined
): boolean => !isNil(getSessionRedirectUrl(session))
