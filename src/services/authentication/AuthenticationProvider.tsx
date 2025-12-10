import React, { FC, useEffect, useRef, useState } from 'react'
import { AuthenticationContext } from './AuthenticationContext'
import { useSessionStorage } from '../../hooks/useSessionStorage'
import { useRouter } from 'next/router'
import useSwr from 'swr'
import { ErrorPage, LoadingPage, TokenClearedErrorPage } from '../../components'
import { useTranslation } from 'next-i18next'
import * as Sentry from '@sentry/nextjs'
interface AuthenticationProviderProps {
  children?: React.ReactNode
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/*
 * Authentication is done in the following steps:
 * 1. We create a new token using the NextJS API and save it as 'accessToken' in sessionStorage. While we create a new accessToken, no other operation is allowed. So loader is shown. 'tokenLoading' state locks the app from further execution.
 * 2. Once accessToken is generated, only then the children components of the app are rendered.
 * 3. The token is removed when the session is completed or expired (handled in pages/index.tsx).
 */
export const AuthenticationProvider: FC<AuthenticationProviderProps> = ({
  children,
}) => {
  const { t } = useTranslation()
  const { storedValue: accessToken, setValue: setAccessToken } =
    useSessionStorage('accessToken', '')
  const router = useRouter()
  const [tokenLoading, setTokenLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)
  const [tokenWasCleared, setTokenWasCleared] = useState(false)
  const previousTokenRef = useRef<string | null>(null)

  const { data, error } = useSwr(
    router.query.sessionId ? `/api/session/${router.query.sessionId}` : null,
    fetcher
  )

  // Set client-side flag after hydration to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (data?.token) {
      setAccessToken(data?.token)
      setTokenLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.token])

  // Log invalid URL when condition is met
  useEffect(() => {
    if (isClient && router.isReady && !router.query.sessionId) {
      Sentry.logger?.warn('Invalid URL - missing sessionId', {
        category: 'navigation',
        url: router.asPath,
        sessionId: router.query.sessionId,
      })
    }
  }, [isClient, router.isReady, router.query.sessionId, router.asPath])

  // Log router readiness state
  useEffect(() => {
    Sentry.logger?.info(
      router.isReady ? 'Router is ready' : 'Router is not ready',
      {
        category: 'navigation',
        url: router.asPath,
        sessionId: router.query.sessionId,
      }
    )
  }, [router.isReady, router.asPath, router.query.sessionId])

  // Log token loading state
  useEffect(() => {
    Sentry.logger?.info(
      tokenLoading ? 'Token is loading' : 'Token loading completed',
      {
        category: 'authentication',
        sessionId: router.query.sessionId,
      }
    )
  }, [tokenLoading, router.query.sessionId])

  // Detect unexpected token clearing
  useEffect(() => {
    if (previousTokenRef.current && !accessToken) {
      setTokenWasCleared(true)
      Sentry.logger?.error('Access token was unexpectedly cleared', {
        category: 'authentication',
        sessionId: router.query.sessionId,
      })
    }
    previousTokenRef.current = accessToken
  }, [accessToken, router.query.sessionId])

  const authenticationContext = {
    isAuthenticated: accessToken !== '',
    accessToken,
    error,
  }

  // Show error page if token was unexpectedly cleared
  if (tokenWasCleared) {
    return (
      <TokenClearedErrorPage sessionId={router.query.sessionId as string} />
    )
  }

  // Only check for missing sessionId on client-side after hydration
  if (isClient && router.isReady && !router.query.sessionId) {
    return <ErrorPage title={t('session.invalid_url')} />
  }

  // Wait while token is being generated
  if (!router.isReady || tokenLoading) {
    return <LoadingPage showLogoBox={true} />
  }

  return (
    <AuthenticationContext.Provider value={authenticationContext}>
      {children}
    </AuthenticationContext.Provider>
  )
}
