import React, { FC, useEffect, useState } from 'react'
import { parse } from 'query-string'
import { AuthenticationContext } from './AuthenticationContext'
import { urlHasAuthState } from './urlHasAuthState'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { useRouter } from 'next/router'
import useSwr from 'swr'

interface AuthenticationProviderProps {
  children?: React.ReactNode
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export const AuthenticationProvider: FC<AuthenticationProviderProps> = ({
  children,
}) => {
  const [accessToken, setAccessToken] = useLocalStorage('accessToken', '')
  const router = useRouter()

  const { data, error } = useSwr(
    router.query.sessionId ? `/api/session/${router.query.sessionId}` : null,
    fetcher
  )

  const authenticationContext = {
    isAuthenticated: accessToken !== '',
    accessToken,
    error,
  }

  return (
    <AuthenticationContext.Provider value={authenticationContext}>
      {children}
    </AuthenticationContext.Provider>
  )
}
