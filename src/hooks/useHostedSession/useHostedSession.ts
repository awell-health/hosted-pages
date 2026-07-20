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
import { Maybe } from '../../types'
import {
  HostedSessionStatus,
  SessionMetadata,
} from '../../types/generated/types-orchestration'
import { type CustomTheme, getTheme } from './branding'
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

const isTerminalSessionStatus = (
  status: HostedSessionStatus | undefined
): boolean =>
  status === HostedSessionStatus.Completed ||
  status === HostedSessionStatus.Expired

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
    handleTerminalSession(updatedHostedSession)

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
  }

  const hostedSession = data?.hostedSession?.session
  const sessionId = hostedSession?.id
  const organizationSlug = hostedSession?.organization_slug
  const sessionStatus = hostedSession?.status
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
  // Only runs when session status changes
  useEffect(() => {
    if (isTerminalSessionStatus(sessionStatus) && hostedSession) {
      handleTerminalSession(hostedSession)
    }
  }, [sessionStatus, hostedSession])

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

  if (loading) {
    return { loading: true, theme: defaultTheme, startPolling, stopPolling }
  }

  if (
    error &&
    !isGraphQLRequestCancellation(error) &&
    !isTerminalSessionStatus(sessionStatus)
  ) {
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
    session: data?.hostedSession?.session,
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
