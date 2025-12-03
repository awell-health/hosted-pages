import React, { FC, useEffect, useState } from 'react'
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

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/*
 * Authentication is done in the following steps:
 * 1. On first load, we remove the accessToken from the sessionStorage. Why? Because sessions are short-termed and are expected to last for short timespans. So we remove the last token for any conflicts between the consecutive sessions.
 * 2. Then we create a new token using the NextJS API and save it as 'accessToken' in sessionStorage. While we create a new accessToken, no other operation is allowed. So loader is shown. 'tokenLoading' state locks the app from further execution.
 * 3. Once accessToken is generated, only then the children components of the app are rendered.
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
  const [tokenLoading, setTokenLoading] = useState(true)
  const [isClient, setIsClient] = useState(false)

  const { data, error } = useSwr(
    router.query.sessionId ? `/api/session/${router.query.sessionId}` : null,
    fetcher
  )

  // @REVIEW - why do we remove the token rather than overwriting/replacing it
  useEffect(() => {
    // remove access token on first load
    removeAccessToken()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  useEffect(() => {
    if (isClient && router.isReady && !router.query.sessionId) {
      Sentry.logger.warn('Invalid URL', {
        category: 'navigation',
        url: router.asPath,
        sessionId: router.query.sessionId,
      })
    }
  }, [isClient, router.isReady, router.query.sessionId, router.asPath])

  useEffect(() => {
    if (!router.isReady || tokenLoading) {
      Sentry.logger.info('Preparing router and/or token', {
        category: 'navigation',
        url: router.asPath,
        sessionId: router.query.sessionId,
      })
    }
  }, [router.isReady, tokenLoading, router.asPath, router.query.sessionId])

  const authenticationContext = {
    isAuthenticated: accessToken !== '',
    accessToken,
    error,
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
