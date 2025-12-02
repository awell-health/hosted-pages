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
 *   throw new HostedSessionError(
 *     error instanceof Error ? error.message : String(error),
 *     {
 *       errorType: 'GRAPHQL_OPERATION_FAILED',
 *       operation: 'SubmitForm',
 *       originalError: error
 *     }
 *   )
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
}

export class HostedSessionError extends Error {
  public readonly errorType: string
  public readonly operation?: string
  public readonly activityId?: string
  public readonly context?: Record<string, unknown>
  public readonly originalError?: unknown

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

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HostedSessionError)
    }
  }
}
