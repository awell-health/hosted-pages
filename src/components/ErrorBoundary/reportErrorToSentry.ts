import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'
import { ErrorInfo } from './types'

export const reportErrorToSentry = (
  error: Error,
  errorInfo: ErrorInfo
): void => {
  // organization_slug will be automatically included from Sentry scope
  // if session was previously loaded (set by useHostedSession useEffect)
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
