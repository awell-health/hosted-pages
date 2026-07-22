import { createContext } from 'react'

export interface AuthenticationContextInterface {
  isAuthenticated: boolean
  accessToken?: string
  sessionId?: string
  error?: string
  clearAccessToken: () => void
}

const initialContext = {
  isAuthenticated: false,
  clearAccessToken: () => undefined,
}

export const AuthenticationContext =
  createContext<AuthenticationContextInterface>(initialContext)
