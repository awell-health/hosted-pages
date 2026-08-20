/* eslint-disable react-hooks/exhaustive-deps */

import { type ApolloQueryResult, useApolloClient } from '@apollo/client'
import * as Sentry from '@sentry/nextjs'
import { isNil } from 'lodash'
import {
  createContext,
  createElement,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  isGraphQLMissingAuthorizationError,
  isGraphQLRequestCancellation,
  updateQuery,
  useGraphQLRequestLifecycle,
} from '../../services/graphql'
import { SESSION_POLL_INTERVAL_MS } from '../../config/polling'
import { Maybe } from '../../types'
import { SessionMetadata } from '../../types/generated/types-orchestration'
import { LogEvent, logger } from '../../utils/logging'
import { type CustomTheme, getTheme } from './branding'
import { isTerminalSessionStatus } from './terminalSession'
import type { HostedSession } from './types'
import {
  BrandingSettings,
  GetHostedSessionDocument,
  GetHostedSessionQuery,
  useGetHostedSessionQuery,
  useOnHostedSessionCompletedSubscription,
  useOnHostedSessionExpiredSubscription,
} from './types'

// Organizations for which we automatically record replays for all sessions
// Comma-separated list from environment variable
const getOrganizationsWithAutoReplay = (): string[] => {
  const orgs = process.env.NEXT_PUBLIC_SENTRY_REPLAY_ORGANIZATIONS
  if (!orgs) return []
  return orgs
    .split(',')
    .map((org) => org.trim())
    .filter(Boolean)
}

// Three visible-mode poll intervals. Past this point the query observable is not
// slow, it is stuck. Only `loading` is gated on this, which is an initial-load
// concern, so the slower hidden-tab interval is deliberately not used here.
const STALLED_SESSION_QUERY_MS = 3 * SESSION_POLL_INTERVAL_MS.visible

export interface UseHostedSessionHook {
  loading: boolean
  session?: HostedSession
  metadata?: SessionMetadata | null
  branding?: Maybe<BrandingSettings>
  theme: CustomTheme
  error?: string
  refetch?: () => Promise<ApolloQueryResult<GetHostedSessionQuery>> | undefined
  startPolling: (_pollInterval: number) => void
  stopPolling: () => void
}

const HostedSessionContext = createContext<UseHostedSessionHook | undefined>(
  undefined
)

const useHostedSessionValue = (): UseHostedSessionHook => {
  const defaultTheme = getTheme()

  const [isSessionCompleted, setIsSessionCompleted] = useState(false)
  // The terminal session is held in React state so the page never depends on the
  // query observable resolving to learn that the session ended. See the comment
  // on the resolved `session` below.
  const [terminalSession, setTerminalSession] = useState<HostedSession>()
  const handledTerminalSessionRef = useRef<string | undefined>()
  const stopPollingRef = useRef<() => void>(() => undefined)
  const requestLifecycle = useGraphQLRequestLifecycle()

  const handleTerminalSession = (updatedHostedSession: HostedSession) => {
    if (!isTerminalSessionStatus(updatedHostedSession.status)) {
      return
    }

    const terminalSessionKey = `${updatedHostedSession.id}:${updatedHostedSession.status}`
    if (handledTerminalSessionRef.current === terminalSessionKey) {
      return
    }

    handledTerminalSessionRef.current = terminalSessionKey
    // Capture the payload before tearing anything down. `cancelPendingRequests()`
    // is a one-way door: after it, no request can ever deliver this status again.
    setTerminalSession(updatedHostedSession)
    setIsSessionCompleted(true)
    stopPollingRef.current()
    requestLifecycle.cancelPendingRequests()
  }

  const { data, loading, error, refetch, stopPolling, startPolling } =
    useGetHostedSessionQuery({
      onCompleted: (completedData) => {
        const completedSession = completedData.hostedSession?.session
        if (completedSession) {
          handleTerminalSession(completedSession)
        }
      },
    })
  stopPollingRef.current = stopPolling
  const client = useApolloClient()

  const onHostedSessionCompleted = useOnHostedSessionCompletedSubscription()
  const onHostedSessionExpired = useOnHostedSessionExpiredSubscription()

  const updateHostedSessionQuery = ({
    updatedHostedSession,
  }: {
    updatedHostedSession: HostedSession
  }) => {
    // Land the new session in the cache *before* `handleTerminalSession` tears
    // the transport down, so the UI can never lose a race against its own
    // teardown. (Necessary but not sufficient on its own: Apollo suppresses
    // cache-driven notifications while a request is in flight, so the resolved
    // `session` below is what actually gets the status to the page.)
    const cachedQuery = client.readQuery<GetHostedSessionQuery>({
      query: GetHostedSessionDocument,
    })
    const updatedQuery = updateQuery<GetHostedSessionQuery, HostedSession>(
      (cachedQuery ?? data) as GetHostedSessionQuery,
      ['hostedSession', 'session'],
      updatedHostedSession
    )
    client.writeQuery({
      query: GetHostedSessionDocument,
      data: updatedQuery,
    })

    handleTerminalSession(updatedHostedSession)
  }

  const queriedSession = data?.hostedSession?.session
  const queriedSessionStatus = queriedSession?.status

  // A terminal status, once known from any source, must reach the page.
  //
  // The query observable cannot be relied on for this. When the `sessionCompleted`
  // frame lands while a `GetHostedSession` poll is in flight, `handleTerminalSession`
  // aborts that poll; Apollo parks the observable on the resulting cancellation
  // (networkStatus `error`) and keeps serving the last pre-completion snapshot.
  // Because `isTerminated` blocks every subsequent request, nothing ever refreshes
  // it — so `data` stays ACTIVE forever even though the cache says COMPLETED.
  // Preferring the terminal payload here makes the redirect independent of the
  // query resolving at all.
  const hasStaleQueriedSession =
    !isNil(terminalSession) && !isTerminalSessionStatus(queriedSessionStatus)
  const hostedSession = hasStaleQueriedSession
    ? terminalSession
    : queriedSession
  const hasTerminalSession = isTerminalSessionStatus(hostedSession?.status)

  const sessionId = hostedSession?.id
  const organizationSlug = hostedSession?.organization_slug
  const pathwayId = hostedSession?.pathway_id
  const stakeholderId = hostedSession?.stakeholder?.id
  const stakeholderName = hostedSession?.stakeholder?.name
  const stakeholderType = hostedSession?.stakeholder?.type
  const successUrl = hostedSession?.success_url
  const cancelUrl = hostedSession?.cancel_url
  const branding = data?.hostedSession?.branding

  // Set Sentry tags, context, and extras only when session ID changes
  // This prevents re-running on every poll/refetch
  useEffect(() => {
    if (!sessionId || !hostedSession) return

    Sentry.setTags({
      pathway: pathwayId,
      stakeholder: stakeholderId,
      session: sessionId,
      organization_slug: organizationSlug,
    })
    sessionStorage.setItem(
      'log-context',
      JSON.stringify({
        pathway: pathwayId,
        stakeholder: stakeholderId,
        session: sessionId,
        organization_slug: organizationSlug,
      })
    )
    Sentry.setContext('session', {
      id: sessionId,
      pathway_id: pathwayId,
      success_url: successUrl,
      cancel_url: cancelUrl,
      organization_slug: organizationSlug,
    })
    Sentry.setContext('stakeholder', {
      id: stakeholderId,
      name: stakeholderName,
      type: stakeholderType,
    })
    Sentry.setExtras({
      hostedSession,
      branding,
    })
  }, [
    sessionId,
    pathwayId,
    stakeholderId,
    stakeholderName,
    stakeholderType,
    organizationSlug,
    successUrl,
    cancelUrl,
    hostedSession,
    branding,
  ])

  // Automatically record replays for specific organizations
  // Only runs when organization_slug changes, not on every poll/refetch
  useEffect(() => {
    if (!organizationSlug) return

    const organizationsWithAutoReplay = getOrganizationsWithAutoReplay()
    if (!organizationsWithAutoReplay.includes(organizationSlug)) return

    // Since replaysOnErrorSampleRate > 0, replays are buffering
    // Calling flush() will upload the buffered replay and continue recording
    const replay = Sentry.getReplay()
    if (replay) {
      // Check if replay is active (has a replay ID)
      // If it does, flush will upload the buffered replay and continue recording
      // If it doesn't, start() will start a new replay session
      const replayId = replay.getReplayId()
      if (replayId) {
        replay.flush()
      } else {
        replay.start()
      }
    }
  }, [organizationSlug])

  // Handle session completion/expiration status
  // Only runs when session status changes.
  // Deliberately keyed on the *queried* session: this is the poll path noticing a
  // terminal status. The push path calls handleTerminalSession directly.
  useEffect(() => {
    if (isTerminalSessionStatus(queriedSessionStatus) && queriedSession) {
      handleTerminalSession(queriedSession)
    }
  }, [queriedSessionStatus, queriedSession])

  useEffect(() => {
    if (isSessionCompleted) {
      stopPolling()
    }
  }, [isSessionCompleted])

  useEffect(() => {
    if (!isNil(onHostedSessionCompleted.data)) {
      const { sessionCompleted } = onHostedSessionCompleted.data
      updateHostedSessionQuery({ updatedHostedSession: sessionCompleted })
    }
  }, [client, onHostedSessionCompleted.data])

  useEffect(() => {
    if (!isNil(onHostedSessionExpired.data)) {
      const { sessionExpired } = onHostedSessionExpired.data
      updateHostedSessionQuery({ updatedHostedSession: sessionExpired })
    }
  }, [client, onHostedSessionExpired.data])

  // The fingerprint of the deadlock this hook used to sit in: the push path knows
  // the session ended, the query observable still reports the old status, and no
  // request will ever reconcile them. The session below is resolved from the push
  // payload, so this is a warning about the transport, not a broken page.
  useEffect(() => {
    if (!hasStaleQueriedSession) return

    logger.warn(
      'Hosted session query is serving a stale status after session completion',
      LogEvent.SESSION_TERMINAL_STATUS_DIVERGED,
      {
        session_id: terminalSession?.id,
        terminal_session_status: terminalSession?.status,
        queried_session_status: queriedSessionStatus ?? null,
        query_loading: loading,
        query_error: error?.message,
        request_lifecycle_terminated: requestLifecycle.isTerminated,
      }
    )
  }, [hasStaleQueriedSession])

  // No request can settle once the lifecycle is terminated, so a query that is
  // still loading past a few poll intervals is wedged rather than slow.
  useEffect(() => {
    if (!loading) return

    const timeout = setTimeout(() => {
      logger.warn(
        'Hosted session query has not settled',
        LogEvent.SESSION_QUERY_STALLED,
        {
          stalled_for_ms: STALLED_SESSION_QUERY_MS,
          session_id: sessionId,
          queried_session_status: queriedSessionStatus ?? null,
          has_terminal_session: hasTerminalSession,
          request_lifecycle_terminated: requestLifecycle.isTerminated,
        }
      )
    }, STALLED_SESSION_QUERY_MS)

    return () => clearTimeout(timeout)
  }, [loading, queriedSessionStatus, hasTerminalSession])

  // A cancelled request must not look like an error (below) — and must not look
  // like `loading` either. Either way, a session we already know to be terminal
  // has to be returned so the page can redirect.
  if (loading && !hasTerminalSession) {
    return { loading: true, theme: defaultTheme, startPolling, stopPolling }
  }

  if (error && !isGraphQLRequestCancellation(error) && !hasTerminalSession) {
    const unauthorizedError = error.graphQLErrors?.find(
      (err) => err.extensions?.code === 'UNAUTHORIZED'
    )
    const missingAuthorizationError = isGraphQLMissingAuthorizationError(error)

    if (!unauthorizedError && !missingAuthorizationError) {
      Sentry.captureException(error)
    }

    const message =
      unauthorizedError || missingAuthorizationError
        ? 'UNAUTHORIZED'
        : error.message

    return {
      loading: false,
      error: message,
      refetch,
      theme: defaultTheme,
      startPolling,
      stopPolling,
    }
  }

  return {
    loading: false,
    session: hostedSession,
    metadata: data?.hostedSession?.metadata,
    branding: data?.hostedSession?.branding,
    theme: getTheme(data?.hostedSession?.branding?.custom_theme),
    refetch,
    startPolling,
    stopPolling,
  }
}

export const HostedSessionProvider: FC<{ children?: ReactNode }> = ({
  children,
}) => {
  const value = useHostedSessionValue()

  return createElement(HostedSessionContext.Provider, { value }, children)
}

export const useHostedSession = (): UseHostedSessionHook => {
  const hostedSession = useContext(HostedSessionContext)

  if (!hostedSession) {
    throw new Error(
      'useHostedSession must be used within HostedSessionProvider'
    )
  }

  return hostedSession
}
