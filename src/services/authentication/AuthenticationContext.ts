import { createContext } from 'react'

export interface AuthenticationContextInterface {
  isAuthenticated: boolean
  accessToken?: string
  error?: string
}

const initialContext = {
  isAuthenticated: false,
}

export const AuthenticationContext =
  createContext<AuthenticationContextInterface>(initialContext)
