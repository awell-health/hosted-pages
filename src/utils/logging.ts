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
 * Required session context for client-side log entries.
 * This ensures consistent querying and filtering in Sentry.
 */
export interface SessionLogContext {
  /** Session ID */
  sessionId?: string | null
  /** Pathway ID */
  pathwayId?: string | null
  /** Stakeholder ID */
  stakeholderId?: string | null
  /** Session status */
  sessionStatus?: string | null
}

/**
 * Attributes for a log entry.
 */
export interface LogAttributes extends SessionLogContext {
  /** Event type identifier (from LogEvent enum or string) */
  event_type: LogEvent | string
  /** Timestamp (automatically added) */
  timestamp: string
  /** Additional context-specific attributes */
  [key: string]: unknown
}

/**
 * Unified logging utility that works for both client and server-side code.
 *
 * Sentry automatically handles the distinction between client and server logs,
 * so we don't need separate utilities.
 *
 * Usage (client-side with session context):
 * ```typescript
 * const { session } = useHostedSession()
 * logger.info(
 *   'Form submitted successfully',
 *   LogEvent.FORM_SUBMITTED,
 *   {
 *     sessionId: session?.id,
 *     pathwayId: session?.pathway_id,
 *     stakeholderId: session?.stakeholder?.id,
 *     sessionStatus: session?.status,
 *     activity: { id: '123' }
 *   }
 * )
 * ```
 *
 * Usage (server-side without session context):
 * ```typescript
 * logger.info('API request completed', LogEvent.SOL_API_REQUEST, {
 *   endpoint: '/api/sol/providers',
 *   duration: 123,
 * })
 * ```
 */
export const logger = {
  info: (
    message: string,
    eventType: LogEvent | string,
    context: Record<string, unknown> = {}
  ) => {
    Sentry.logger.info(message, {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...context,
    } as LogAttributes)
  },

  warn: (
    message: string,
    eventType: LogEvent | string,
    context: Record<string, unknown> = {}
  ) => {
    Sentry.logger.warn(message, {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...context,
    } as LogAttributes)
  },

  error: (
    message: string,
    eventType: LogEvent | string,
    context: Record<string, unknown> = {}
  ) => {
    Sentry.logger.error(message, {
      event_type: eventType,
      timestamp: new Date().toISOString(),
      ...context,
    } as LogAttributes)
  },
}
