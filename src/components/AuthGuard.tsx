import React, { FC } from 'react'
import { useAuthentication } from '../services/authentication'

export const AuthGuard: FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { error } = useAuthentication()

  if (error) {
    return <p>ERROR: {JSON.stringify(error)}</p>
  }
  return <>{children}</>
}

AuthGuard.displayName = 'AuthGuard'
