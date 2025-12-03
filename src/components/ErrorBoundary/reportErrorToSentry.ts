import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'
import { ErrorInfo } from './types'

export const reportErrorToSentry = (
  error: Error,
  errorInfo: ErrorInfo
): void => {
  const hostedSessionError = new HostedSessionError(
    error.message || 'React Error Boundary caught an error',
    {
      errorType: 'REACT_ERROR_BOUNDARY',
      originalError: error,
      contexts: {
        location: { location: window.location.pathname },
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
    }
  )
  captureHostedSessionError(hostedSessionError)
}
