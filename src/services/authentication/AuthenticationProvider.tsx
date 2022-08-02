import React, { FC, useEffect, useState } from 'react'
import { parse } from 'query-string'
import { AuthenticationContext } from './AuthenticationContext'
import { urlHasAuthState } from './urlHasAuthState'
import { useLocalStorage } from '../../hooks/useLocalStorage'

interface AuthenticationProviderProps {
  children?: React.ReactNode
}

export const AuthenticationProvider: FC<AuthenticationProviderProps> = ({
  children,
}) => {
  const [isLoading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const [accessToken, setAccessToken] = useLocalStorage('accessToken', '')

  useEffect(() => {
    console.log(urlHasAuthState(), 'hasUrlstate')
    if (urlHasAuthState()) {
      setLoading(true)
      const { search } = window.location
      const { sessionId } = parse(search)
      console.log(sessionId)
      if (sessionId) {
        setAccessToken(sessionId as string)
        setLoading(false)
      } else {
        setError('Missing sessionId')
        setLoading(false)
      }
    } else {
      setError('Missing sessionId')
    }
  }, [window.location])

  const authenticationContext = {
    isAuthenticated: accessToken !== '',
    isLoading,
    accessToken,
    error,
  }

  return (
    <AuthenticationContext.Provider value={authenticationContext}>
      {children}
    </AuthenticationContext.Provider>
  )
}
