import * as Sentry from '@sentry/nextjs'
import { ErrorInfo } from './types'

export const reportErrorToSentry = (
  error: Error,
  errorInfo: ErrorInfo,
  pathwayId?: string
): void => {
  Sentry.withScope((scope) => {
    scope.setTag('pathway_id', pathwayId)
    scope.setContext('location', { location: window.location.pathname })
    Sentry.captureException({ error, errorInfo, pathwayId })
  })
}
