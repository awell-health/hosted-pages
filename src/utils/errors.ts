import * as Sentry from '@sentry/nextjs'

/**
 * Safely serializes an error or unknown value to a string for logging.
 *
 * This utility handles various error types more robustly than simple string casting:
 * - Error instances: Extracts message, name, and stack trace
 * - Plain objects: Uses JSON.stringify with circular reference protection
 * - Primitives: Converts to string
 * - null/undefined: Returns descriptive strings
 *
 * @param error - The error or value to serialize
 * @returns A string representation of the error
 *
 * @example
 * ```typescript
 * serializeError(new Error('Something went wrong'))
 * // Returns: "Error: Something went wrong"
 *
 * serializeError({ code: 500, message: 'Internal error' })
 * // Returns: '{"code":500,"message":"Internal error"}'
 *
 * serializeError(null)
 * // Returns: "null"
 * ```
 */
export const serializeError = (error: unknown): string => {
  if (error === null) {
    return 'null'
  }

  if (error === undefined) {
    return 'undefined'
  }

  if (error instanceof Error) {
    // Prefer stack trace if available (includes name, message, and stack)
    if (error.stack) {
      return error.stack
    }
    // Fallback to name: message format if no stack trace
    const parts = [error.name || 'Error']
    if (error.message) {
      parts.push(error.message)
    }
    return parts.join(': ') || 'Error'
  }

  // Handle primitives
  if (
    typeof error === 'string' ||
    typeof error === 'number' ||
    typeof error === 'boolean' ||
    typeof error === 'bigint' ||
    typeof error === 'symbol'
  ) {
    return String(error)
  }

  // Handle objects and arrays
  // Use Set to track visited objects for circular reference detection
  const seen = new Set<object>()
  try {
    return JSON.stringify(error, (key, value) => {
      // Handle circular references
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return '[Circular]'
        }
        seen.add(value)
      }
      return value
    })
  } catch {
    // Fallback if JSON.stringify fails (e.g., due to circular references or other issues)
    // Last resort: use Object.prototype.toString
    return Object.prototype.toString.call(error)
  }
}

/**
 * Custom error class for hosted sessions with fingerprinting support.
 *
 * This error class allows us to define fingerprinting strategies for Sentry
 * error grouping. The fingerprint is determined by the error type and context
 * parameters passed when instantiating the error.
 *
 * Usage:
 * ```typescript
 * try {
 *   // some operation
 * } catch (error) {
 *   const hostedSessionError = new HostedSessionError(
 *     error instanceof Error ? error.message : String(error),
 *     {
 *       errorType: 'GRAPHQL_OPERATION_FAILED',
 *       operation: 'SubmitForm',
 *       originalError: error,
 *       level: 'error',
 *       tags: { graphql_operation: 'SubmitForm' },
 *       contexts: {
 *         graphql: { query: 'SubmitForm' }
 *       }
 *     }
 *   )
 *   captureHostedSessionError(hostedSessionError)
 * }
 */
export interface HostedSessionErrorContext {
  /**
   * Error type identifier (e.g., 'GRAPHQL_OPERATION_FAILED', 'NETWORK_ERROR', 'FORM_SUBMISSION_FAILED')
   */
  errorType: string
  /**
   * Optional operation name (e.g., GraphQL operation name)
   */
  operation?: string
  /**
   * Optional activity ID for activity-specific errors
   */
  activityId?: string
  /**
   * Optional additional context
   */
  context?: Record<string, unknown>
  /**
   * Original error that was caught
   */
  originalError?: unknown
  /**
   * Sentry error level ('error', 'warning', 'info', 'debug', 'fatal')
   */
  level?: Sentry.SeverityLevel
  /**
   * Sentry tags for filtering and grouping
   */
  tags?: Record<string, string>
  /**
   * Sentry contexts for additional structured data
   */
  contexts?: Record<string, Record<string, unknown>>
}

export class HostedSessionError extends Error {
  public readonly errorType: string
  public readonly operation?: string
  public readonly activityId?: string
  public readonly context?: Record<string, unknown>
  public readonly originalError?: unknown
  public readonly level?: Sentry.SeverityLevel
  public readonly tags?: Record<string, string>
  public readonly contexts?: Record<string, Record<string, unknown>>

  /**
   * Returns the fingerprint array for Sentry error grouping.
   *
   * Fingerprinting strategy:
   * - Identifiable errors: Use errorType + operation
   * - This groups similar errors together while maintaining context
   */
  public getFingerprint(): string[] {
    const parts = [this.errorType]

    if (this.operation) {
      parts.push(this.operation)
    }

    return parts
  }

  constructor(message: string, context: HostedSessionErrorContext) {
    super(message)
    this.name = 'HostedSessionError'
    this.errorType = context.errorType
    this.operation = context.operation
    this.activityId = context.activityId
    this.context = context.context
    this.originalError = context.originalError
    this.level = context.level
    this.tags = context.tags
    this.contexts = context.contexts

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HostedSessionError)
    }
  }
}

/**
 * Captures a HostedSessionError to Sentry, extracting level, tags, and contexts from the error.
 * This ensures consistency in error reporting across the application.
 */
export const captureHostedSessionError = (error: HostedSessionError): void => {
  Sentry.captureException(error, {
    level: error.level,
    tags: error.tags,
    contexts: error.contexts,
  })
}
