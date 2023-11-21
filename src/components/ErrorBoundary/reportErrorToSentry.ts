import * as Sentry from '@sentry/nextjs'
import { ErrorInfo } from './types'

export const reportErrorToSentry = (
  error: Error,
  errorInfo: ErrorInfo
): void => {
  Sentry.withScope((scope) => {
    scope.setContext('location', { location: window.location.pathname })
    Sentry.captureException({ error, errorInfo })
  })
}
