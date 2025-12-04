/* eslint-disable react-hooks/exhaustive-deps */

import {
  useGetHostedSessionQuery,
  useOnHostedSessionCompletedSubscription,
  useOnHostedSessionExpiredSubscription,
  GetHostedSessionDocument,
  GetHostedSessionQuery,
  BrandingSettings,
} from './types'
import type { HostedSession } from './types'
import { useEffect, useState } from 'react'
import { isNil } from 'lodash'
import { type ApolloQueryResult, useApolloClient } from '@apollo/client'
import { updateQuery } from '../../services/graphql'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/router'
import { Maybe } from '../../types'
import { type CustomTheme, getTheme } from './branding'
import {
  HostedSessionStatus,
  SessionMetadata,
} from '../../types/generated/types-orchestration'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'

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

interface UseHostedSessionHook {
  loading: boolean
  session?: HostedSession
  metadata?: SessionMetadata | null
  branding?: Maybe<BrandingSettings>
  theme: CustomTheme
  error?: string
  refetch?: () => Promise<ApolloQueryResult<GetHostedSessionQuery>> | undefined
  startPolling: (pollInterval: number) => void
  stopPolling: () => void
}

export const useHostedSession = (): UseHostedSessionHook => {
  const defaultTheme = getTheme()

  const [isSessionCompleted, setIsSessionCompleted] = useState(false)

  const { data, loading, error, refetch, stopPolling, startPolling } =
    useGetHostedSessionQuery({
      onError: (error) => {
        // organization_slug will be automatically included from Sentry scope
        // if session was previously loaded (set by useHostedSession useEffect)
        const hostedSessionError = new HostedSessionError(
          'Failed to get hosted session',
          {
            errorType: 'SESSION_INITIALIZATION_FAILED',
            operation: 'GetHostedSession',
            originalError: error,
            contexts: {
              graphql: {
                query: 'GetHostedSession',
              },
            },
          }
        )
        captureHostedSessionError(hostedSessionError)
      },
    })
  const client = useApolloClient()
  const router = useRouter()

  const onHostedSessionCompleted = useOnHostedSessionCompletedSubscription()
  const onHostedSessionExpired = useOnHostedSessionExpiredSubscription()

  const updateHostedSessionQuery = ({
    updatedHostedSession,
  }: {
    updatedHostedSession: HostedSession
  }) => {
    const updatedQuery = updateQuery<GetHostedSessionQuery, HostedSession>(
      data as GetHostedSessionQuery,
      ['hostedSession', 'session'],
      updatedHostedSession
    )
    client.writeQuery({
      query: GetHostedSessionDocument,
      data: updatedQuery,
    })

    if (
      updatedHostedSession.status === HostedSessionStatus.Completed ||
      updatedHostedSession.status === HostedSessionStatus.Expired
    ) {
      setIsSessionCompleted(true)
    }
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
    if (
      sessionStatus === HostedSessionStatus.Completed ||
      sessionStatus === HostedSessionStatus.Expired
    ) {
      setIsSessionCompleted(true)
    }
  }, [sessionStatus])

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

  if (error) {
    const unauthorizedError = error.graphQLErrors?.find(
      (err) => err.extensions?.code === 'UNAUTHORIZED'
    )

    const message = unauthorizedError ? 'UNAUTHORIZED' : error.message

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
