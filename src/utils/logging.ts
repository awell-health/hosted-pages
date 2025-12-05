import * as Sentry from '@sentry/nextjs'

/**
 * Event type identifiers for logging.
 * Used to categorize and filter log entries in Sentry.
 */
export enum LogEvent {
  FORM_SUBMITTING = 'FORM_SUBMITTING',
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  FORM_SUBMISSION_FAILED = 'FORM_SUBMISSION_FAILED',
  FORM_LOADING = 'FORM_LOADING',
  FORM_FETCH_FAILED = 'FORM_FETCH_FAILED',
  FORM_RULE_EVALUATION_FAILED = 'FORM_RULE_EVALUATION_FAILED',

  SESSION_ONGOING = 'SESSION_ONGOING',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_COMPLETED = 'SESSION_COMPLETED',
  SESSION_EXIT = 'SESSION_EXIT',

  MESSAGE_MARKING_AS_READ = 'MESSAGE_MARKING_AS_READ',
  MESSAGE_MARKED_AS_READ = 'MESSAGE_MARKED_AS_READ',
  MESSAGE_MARKING_AS_READ_FAILED = 'MESSAGE_MARKING_AS_READ_FAILED',

  CHECKLIST_SUBMITTING = 'CHECKLIST_SUBMITTING',
  CHECKLIST_SUBMITTED = 'CHECKLIST_SUBMITTED',
  CHECKLIST_SUBMITTING_FAILED = 'CHECKLIST_SUBMITTING_FAILED',

  ACTIVITIES_FETCH_FAILED = 'ACTIVITIES_FETCH_FAILED',
  ACTIVITIES_LIST_CHANGED = 'ACTIVITIES_LIST_CHANGED',
  ACTIVITY_LOADING = 'ACTIVITY_LOADING',
  ACTIVITY_CHANGED = 'ACTIVITY_CHANGED',
  ACTIVITY_NO_ACTIVE_FOUND = 'ACTIVITY_NO_ACTIVE_FOUND',

  ACTIVITIES_START_POLLING = 'ACTIVITIES_START_POLLING',
  ACTIVITIES_STOP_POLLING = 'ACTIVITIES_STOP_POLLING',

  SUBSCRIPTION_ACTIVITY_CREATED = 'SUBSCRIPTION_ACTIVITY_CREATED',
  SUBSCRIPTION_ACTIVITY_COMPLETED = 'SUBSCRIPTION_ACTIVITY_COMPLETED',
  SUBSCRIPTION_ACTIVITY_EXPIRED = 'SUBSCRIPTION_ACTIVITY_EXPIRED',
  SUBSCRIPTION_ACTIVITY_DUPLICATE = 'SUBSCRIPTION_ACTIVITY_DUPLICATE',

  GRAPHQL_WS_CONNECTED = 'GRAPHQL_WS_CONNECTED',
  GRAPHQL_WS_ERROR = 'GRAPHQL_WS_ERROR',
  GRAPHQL_WS_DISCONNECTED = 'GRAPHQL_WS_DISCONNECTED',

  REMOTE_SINGLE_SELECT_OPTIONS = 'REMOTE_SINGLE_SELECT_OPTIONS',

  SOL_API_REQUEST = 'SOL_API_REQUEST',
  WP_API_REQUEST = 'WP_API_REQUEST',
}

/**
 * Attributes for a log entry.
 */
export interface LogAttributes {
  /** Event type identifier (from LogEvent enum or string) */
  event_type: LogEvent | string
  /** Timestamp (automatically added) */
  timestamp: string
  /** Additional context-specific attributes */
  [key: string]: unknown
}

const getLogAttributesFromSessionStore = (): Record<string, unknown> => {
  try {
    const logContext = sessionStorage.getItem('log-context')
    if (!logContext) return {}

    return JSON.parse(logContext)
  } catch {
    return {}
  }
}

/**
 * Unified logging utility that works for both client and server-side code.
 *
 * Sentry automatically handles the distinction between client and server logs,
 * so we don't need separate utilities.
 *
 * The logger automatically includes session context tags (sessionId, pathwayId,
 * stakeholderId, organization_slug) from Sentry scope when available.
 *
 * Usage (client-side - session context automatically included from scope):
 * ```typescript
 * logger.info('Form submitted successfully', LogEvent.FORM_SUBMITTED, {
 *   activity: { id: '123' }
 * })
 * ```
 *
 * Usage (server-side without session context):
 * ```typescript
 * logger.info('API request completed', LogEvent.SOL_API_REQUEST, {
 *   endpoint: '/api/sol/providers',
 *   duration: 123,
 *   organization_slug: result.organization_slug,
 * })
 * ```
 */
export const logger = {
  info: (
    message: string,
    eventType: LogEvent | string,
    context: Record<string, unknown> = {}
  ) => {
    const sessionContext = getLogAttributesFromSessionStore()
    Sentry.logger.info(message, {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...sessionContext,
      ...context,
    } as LogAttributes)
  },

  warn: (
    message: string,
    eventType: LogEvent | string,
    context: Record<string, unknown> = {}
  ) => {
    const sessionContext = getLogAttributesFromSessionStore()
    Sentry.logger.warn(message, {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...sessionContext,
      ...context,
    } as LogAttributes)
  },

  error: (
    message: string,
    eventType: LogEvent | string,
    context: Record<string, unknown> = {}
  ) => {
    const sessionContext = getLogAttributesFromSessionStore()
    Sentry.logger.error(message, {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...sessionContext,
      ...context,
    } as LogAttributes)
  },
}
