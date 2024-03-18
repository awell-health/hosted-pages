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
import { useEffect } from 'react'
import { isNil } from 'lodash'
import { useApolloClient } from '@apollo/client'
import { updateQuery } from '../../services/graphql'
import * as Sentry from '@sentry/nextjs'
import { useRouter } from 'next/router'
import { Maybe } from '../../types'
import {
  CustomThemeApiField,
  CustomThemeFieldsType,
} from './branding/validation.zod'

interface UseHostedSessionHook {
  loading: boolean
  session?: HostedSession
  branding?: Maybe<BrandingSettings>
  customTheme: CustomThemeFieldsType
  error?: string
  refetch?: () => {}
}

const POLLING_DELAY_MS = 2000

export const useHostedSession = (): UseHostedSessionHook => {
  const { data, loading, error, refetch } = useGetHostedSessionQuery({
    pollInterval: POLLING_DELAY_MS,
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
    return { loading: true, customTheme: CustomThemeApiField.parse({}) }
  }

  if (error) {
    return {
      loading: false,
      error: error.message,
      refetch,
      customTheme: CustomThemeApiField.parse({}),
    }
  }

  return {
    loading: false,
    session: data?.hostedSession?.session,
    branding: data?.hostedSession?.branding,
    customTheme: CustomThemeApiField.parse(
      //@ts-expect-error TO REMOVE WHEN INTEGRATING THE BACK-END
      data?.hostedSession?.branding?.custom_theme
    ),
    refetch,
  }
}
