import React, { FC, useCallback, useEffect, useRef, useState } from 'react'
import { AuthenticationContext } from './AuthenticationContext'
import { useSessionStorage } from '../../hooks/useSessionStorage'
import { useRouter } from 'next/router'
import useSwr from 'swr'
import { ErrorPage, LoadingPage } from '../../components'
import { useTranslation } from 'next-i18next'
import * as Sentry from '@sentry/nextjs'
interface AuthenticationProviderProps {
  children?: React.ReactNode
}

const AUTHENTICATION_TIMEOUT_MS = 15000

type AuthenticationStatus =
  | 'loading'
  | 'authenticated'
  | 'failed'
  | 'terminated'

export const fetchAuthenticationToken = async (url: string) => {
  const controller = new AbortController()
  const timeout = setTimeout(
    () => controller.abort(),
    AUTHENTICATION_TIMEOUT_MS
  )

  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) {
      throw new Error(`Authentication request failed with ${response.status}`)
    }
    const data = await response.json()
    if (typeof data?.token !== 'string' || data.token.length === 0) {
      throw new Error('Authentication response did not include a token')
    }

    return { ...data, requestUrl: url }
  } finally {
    clearTimeout(timeout)
  }
}

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
  const {
    storedValue: accessToken,
    setValue: setAccessToken,
    removeItem: removeAccessToken,
  } = useSessionStorage('accessToken', '')
  const router = useRouter()
  const [authenticationStatus, setAuthenticationStatus] =
    useState<AuthenticationStatus>('loading')
  const [authenticatedSessionId, setAuthenticatedSessionId] = useState<string>()
  const [isClient, setIsClient] = useState(false)
  const authenticatedSessionIdRef = useRef<string>()
  const terminatedSessionIdRef = useRef<string>()
  const previousTokenRef = useRef<string | null>(null)
  const intentionalTokenClearRef = useRef(false)
  const sessionId =
    typeof router.query.sessionId === 'string'
      ? router.query.sessionId
      : undefined
  const sessionTokenUrl = sessionId ? `/api/session/${sessionId}` : null

  const removeStoredAccessToken = useCallback(() => {
    intentionalTokenClearRef.current = true
    removeAccessToken()
  }, [removeAccessToken])

  const authenticationRequestUrl =
    authenticationStatus === 'terminated' &&
    terminatedSessionIdRef.current === sessionId
      ? null
      : sessionTokenUrl
  const { data, error, mutate } = useSwr(
    authenticationRequestUrl,
    fetchAuthenticationToken
  )

  const clearAccessToken = useCallback(() => {
    terminatedSessionIdRef.current = sessionId
    setAuthenticationStatus('terminated')
    removeStoredAccessToken()
    void mutate(undefined, false)
  }, [mutate, removeStoredAccessToken, sessionId])

  // Set client-side flag after hydration to prevent hydration mismatches
  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (
      !data?.token ||
      !sessionId ||
      data.requestUrl !== sessionTokenUrl ||
      terminatedSessionIdRef.current === sessionId
    ) {
      return
    }

    if (accessToken !== data.token) {
      setAccessToken(data.token)
    }
    authenticatedSessionIdRef.current = sessionId
    setAuthenticatedSessionId(sessionId)
    setAuthenticationStatus('authenticated')
  }, [
    accessToken,
    data?.token,
    data?.requestUrl,
    sessionId,
    sessionTokenUrl,
    setAccessToken,
  ])

  useEffect(() => {
    if (!router.isReady || !sessionId) {
      return
    }

    if (authenticatedSessionIdRef.current !== sessionId) {
      terminatedSessionIdRef.current = undefined
      authenticatedSessionIdRef.current = undefined
      setAuthenticatedSessionId(undefined)
      setAuthenticationStatus('loading')
      removeStoredAccessToken()
    }
  }, [removeStoredAccessToken, router.isReady, sessionId])

  useEffect(() => {
    if (error && sessionId && authenticatedSessionIdRef.current !== sessionId) {
      setAuthenticationStatus('failed')
    }
  }, [error, sessionId])

  // Log invalid URL when condition is met
  useEffect(() => {
    if (isClient && router.isReady && !sessionId) {
      Sentry.logger?.warn('Invalid URL - missing sessionId', {
        category: 'navigation',
        url: router.asPath,
        sessionId: router.query.sessionId,
      })
    }
  }, [
    isClient,
    router.isReady,
    router.query.sessionId,
    router.asPath,
    sessionId,
  ])

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
      authenticationStatus === 'loading'
        ? 'Token is loading'
        : `Authentication status changed to ${authenticationStatus}`,
      {
        category: 'authentication',
        sessionId: router.query.sessionId,
      }
    )
  }, [authenticationStatus, router.query.sessionId])

  // Log unexpected token clearing for observability
  useEffect(() => {
    if (previousTokenRef.current && !accessToken) {
      if (intentionalTokenClearRef.current) {
        intentionalTokenClearRef.current = false
      } else {
        Sentry.logger?.error('Access token was unexpectedly cleared', {
          category: 'authentication',
          sessionId: router.query.sessionId,
        })
      }
    }
    previousTokenRef.current = accessToken
  }, [accessToken, router.query.sessionId])

  const authenticationContext = {
    isAuthenticated: accessToken !== '',
    accessToken,
    sessionId: authenticatedSessionId,
    error: authenticationStatus === 'failed' ? error : undefined,
    clearAccessToken,
  }
  const isSwitchingSession =
    authenticatedSessionId !== undefined &&
    sessionId !== undefined &&
    authenticatedSessionId !== sessionId

  // Only check for missing sessionId on client-side after hydration
  if (isClient && router.isReady && !sessionId) {
    return <ErrorPage title={t('session.invalid_url')} />
  }

  // Block the previous session tree synchronously when the URL changes. Effects
  // run after paint, which is too late for patient/session isolation.
  if (isSwitchingSession) {
    return <LoadingPage showLogoBox={true} />
  }

  if (authenticationStatus === 'failed') {
    return (
      <ErrorPage
        title={t('session.loading_error')}
        onRetry={() => {
          setAuthenticationStatus('loading')
          void mutate().catch(() => {
            setAuthenticationStatus('failed')
          })
        }}
      />
    )
  }

  // Wait while token is being generated
  if (!router.isReady || authenticationStatus === 'loading') {
    return <LoadingPage showLogoBox={true} />
  }

  return (
    <AuthenticationContext.Provider value={authenticationContext}>
      {children}
    </AuthenticationContext.Provider>
  )
}
