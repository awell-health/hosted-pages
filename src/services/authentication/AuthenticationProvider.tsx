import React, { FC, useEffect, useState } from 'react'
import { parse } from 'query-string'
import { AuthenticationContext } from './AuthenticationContext'
import { urlHasAuthState } from './urlHasAuthState'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useRouter } from 'next/router'
import useSwr from 'swr'
import { ErrorPage, LoadingPage } from '../../components'
import { useTranslation } from 'next-i18next'
import { isNil } from 'lodash'
interface AuthenticationProviderProps {
  children?: React.ReactNode
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

/*
 * Authentication is done in the following steps:
 * 1. On first load, we remove the accessToken from the localStorage. Why? Because sessions are short-termed and are expected to last for short timespans. So we remove the last token for any conflicts between the consecutive sessions.
 * 2. Then we create a new token using the NextJS API and save it as 'accessToken' in localStorage. While we create a new accessToken, no other operation is allowed. So loader is shown. 'tokenLoading' state locks the app from further execution.
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
  } = useLocalStorage('accessToken', '')
  const router = useRouter()
  const [tokenLoading, setTokenLoading] = useState(true)

  const { data, error } = useSwr(
    router.query.sessionId ? `/api/session/${router.query.sessionId}` : null,
    fetcher
  )

  useEffect(() => {
    // remove access token on first load
    removeAccessToken()
  }, [removeAccessToken])

  useEffect(() => {
    if (data?.token) {
      setAccessToken(data?.token)
      setTokenLoading(false)
    }
  }, [data?.token, setAccessToken])

  const authenticationContext = {
    isAuthenticated: accessToken !== '',
    accessToken,
    error,
  }

  if (router.isReady && !router.query.sessionId) {
    return <ErrorPage title={t('error_invalid_url')} />
  }

  // Wait while token is being generated
  if (!router.isReady || tokenLoading) {
    return <LoadingPage title={t('authentication_loading')} />
  }

  return (
    <AuthenticationContext.Provider value={authenticationContext}>
      {children}
    </AuthenticationContext.Provider>
  )
}
