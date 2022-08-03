import { useContext } from 'react'
import {
  AuthenticationContext,
  AuthenticationContextInterface,
} from './AuthenticationContext'

export const useAuthentication = (): AuthenticationContextInterface =>
  useContext(AuthenticationContext)
