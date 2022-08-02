import { createContext } from 'react'

export interface AuthenticationContextInterface {
  isAuthenticated: boolean
  isLoading: boolean
  accessToken?: string
  error?: string
}

const initialContext = {
  isAuthenticated: false,
  isLoading: false,
}

export const AuthenticationContext =
  createContext<AuthenticationContextInterface>(initialContext)
