import React, { FC } from 'react'
import { useAuthentication } from '../services/authentication'

export const AuthGuard: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, error } = useAuthentication()

  // TODO add proper spinner
  if (isLoading) {
    console.log('loading...')
    return <span>Loading....</span>
  }

  if (error) {
    console.log('error', error)

    return <p>{error}</p>
  }
  console.log(isAuthenticated, 'render as usual 😎')
  return <>{children}</>
}

AuthGuard.displayName = 'AuthGuard'
