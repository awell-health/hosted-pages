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

interface UseHostedSessionHook {
  loading: boolean
  session?: HostedSession
  branding?: BrandingSettings
  error?: string
}

export const useHostedSession = (): UseHostedSessionHook => {
  const { data, loading, error } = useGetHostedSessionQuery()
  const client = useApolloClient()

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
    return { loading: true }
  }

  if (error) {
    return { loading: false, error: error.message }
  }

  return {
    loading: false,
    session: data?.hostedSession?.session,
    branding: data?.hostedSession?.branding as BrandingSettings,
  }
}
