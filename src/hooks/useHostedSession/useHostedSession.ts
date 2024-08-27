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
import { useApolloClient } from '@apollo/client'
import { updateQuery } from '../../services/graphql'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/router'
import { Maybe } from '../../types'
import { type CustomTheme, getTheme } from './branding'
import {
  HostedSessionStatus,
  SessionMetadata,
} from '../../types/generated/types-orchestration'

interface UseHostedSessionHook {
  loading: boolean
  session?: HostedSession
  metadata?: SessionMetadata | null
  branding?: Maybe<BrandingSettings>
  theme: CustomTheme
  error?: string
  refetch?: () => {}
}

const POLLING_DELAY_MS = 2000

export const useHostedSession = (): UseHostedSessionHook => {
  const defaultTheme = getTheme()

  const [isSessionCompleted, setIsSessionCompleted] = useState(false)

  const pollInterval = isSessionCompleted ? undefined : POLLING_DELAY_MS

  const { data, loading, error, refetch } = useGetHostedSessionQuery({
    pollInterval,
    onError: (error) => {
      Sentry.captureException(error, {
        contexts: {
          graphql: {
            query: 'GetHostedSession',
          },
        },
      })
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

  useEffect(() => {
    if (!isNil(router)) {
      Sentry.setTags({
        session: router.query.sessionId as string,
        api_endpoint: process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API,
      })
    }
  })

  useEffect(() => {
    if (!isNil(data?.hostedSession?.session)) {
      const hostedSession = data?.hostedSession.session
      Sentry.setTags({
        pathway: hostedSession?.pathway_id,
        stakeholder: hostedSession?.stakeholder.id,
      })
      Sentry.setContext('session', {
        id: hostedSession?.id,
        pathway_id: hostedSession?.pathway_id,
        success_url: hostedSession?.success_url,
        cancel_url: hostedSession?.cancel_url,
      })
      Sentry.setContext('stakeholder', {
        id: hostedSession?.stakeholder.id,
        name: hostedSession?.stakeholder.name,
        type: hostedSession?.stakeholder.type,
      })
      Sentry.setExtras({
        hostedSession,
        branding: data?.hostedSession.branding,
      })
    }
  }, [data])

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
    return { loading: true, theme: defaultTheme }
  }

  if (error) {
    const unauthorizedError = error.graphQLErrors?.find(
      (err) => err.extensions?.code === 'UNAUTHORIZED'
    )

    const message = unauthorizedError
      ? // TODO: update this message with translation
        'Session has already been completed or expired.'
      : error.message

    return {
      loading: false,
      error: message,
      refetch,
      theme: defaultTheme,
    }
  }

  return {
    loading: false,
    session: data?.hostedSession?.session,
    metadata: data?.hostedSession?.metadata,
    branding: data?.hostedSession?.branding,
    theme: getTheme(data?.hostedSession?.branding?.custom_theme),
    refetch,
  }
}
