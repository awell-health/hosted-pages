import { useTranslation } from 'react-i18next'
import { useGetHostedSessionQuery } from './types'
import type { HostedSession } from './types'

interface UseHostedSessionHook {
  loading: boolean
  session?: HostedSession
  error?: string
}

export const useHostedSession = (): UseHostedSessionHook => {
  const { t } = useTranslation()

  const { data, loading, error } = useGetHostedSessionQuery()

  if (loading) {
    return { loading: true }
  }

  if (error) {
    return { loading: false, error: error.message }
  }

  return {
    loading: false,
    session: data?.hostedSession?.session,
  }
}
