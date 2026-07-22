import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  DocumentNode,
  InMemoryCache,
  InMemoryCacheConfig,
  NormalizedCacheObject,
  Observable,
  split,
} from '@apollo/client'
import { ErrorLink, onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient as createWebsocketClient } from 'graphql-ws'
import type { Client as GraphQLWsClient, Message } from 'graphql-ws'
import { isNil } from 'lodash'
import * as Sentry from '@sentry/nextjs'
import { serializeError } from '../../utils/errors'
import { LogEvent, logger } from '../../utils/logging'

const GRAPHQL_WS_KEEPALIVE_INTERVAL_MS = 10000
const GRAPHQL_WS_KEEPALIVE_TIMEOUT_MS = 5000
const GRAPHQL_WS_KEEPALIVE_TIMEOUT_CODE = 4408
const GRAPHQL_WS_KEEPALIVE_TIMEOUT_REASON = 'Request Timeout'
const GRAPHQL_WS_CONNECTION_ACK_TIMEOUT_MS = 10000
const GRAPHQL_REQUEST_CANCELLED = 'GRAPHQL_REQUEST_CANCELLED'
const GRAPHQL_AUTHORIZATION_MISSING = 'GRAPHQL_AUTHORIZATION_MISSING'

export interface GraphQLRequestLifecycle {
  readonly isTerminated: boolean
  trackRequest: (
    _controller: AbortController,
    _policy: GraphQLRequestTeardownPolicy,
    _operationIdentity?: string
  ) => void
  releaseRequest: (
    _controller: AbortController,
    _outcome?: GraphQLRequestOutcome
  ) => boolean
  trackWebSocketClient: (_client: GraphQLWsClient) => void
  cancelPendingRequests: (_options?: { abortSettling?: boolean }) => void
  waitForSettlingRequests: (
    _timeoutMs?: number
  ) => Promise<GraphQLSettlingResult>
}

export type GraphQLRequestTeardownPolicy = 'abort' | 'settle'
export type GraphQLRequestOutcome = 'succeeded' | 'failed'
export type GraphQLSettlingResult =
  | { status: 'settled' }
  | { status: 'failed'; operations: string[] }
  | { status: 'timed-out'; operations: string[] }

interface SettlingRequest {
  operationIdentity: string
  attempt: number
}

export const createGraphQLRequestLifecycle = (): GraphQLRequestLifecycle => {
  const abortableRequestControllers = new Set<AbortController>()
  const settlingRequestControllers = new Map<AbortController, SettlingRequest>()
  const failedSettlingOperations = new Map<string, number>()
  const latestSuccessfulAttempts = new Map<string, number>()
  const operationAttempts = new Map<string, number>()
  const activeWebSocketClients = new Set<GraphQLWsClient>()
  const settlingRequestWaiters = new Set<
    (_result: GraphQLSettlingResult) => void
  >()
  let isTerminated = false

  const getFailedOperations = (): string[] =>
    Array.from(failedSettlingOperations.keys())

  const getSettlingResult = (): GraphQLSettlingResult =>
    failedSettlingOperations.size > 0
      ? { status: 'failed', operations: getFailedOperations() }
      : { status: 'settled' }

  const resolveSettlingRequestWaiters = () => {
    if (settlingRequestControllers.size > 0) {
      return
    }
    const result = getSettlingResult()
    settlingRequestWaiters.forEach((resolve) => resolve(result))
    settlingRequestWaiters.clear()
  }

  return {
    get isTerminated() {
      return isTerminated
    },
    trackRequest: (controller, policy, operationIdentity = 'unknown') => {
      if (isTerminated) {
        controller.abort()
        return
      }
      if (policy === 'settle') {
        const attempt = (operationAttempts.get(operationIdentity) ?? 0) + 1
        operationAttempts.set(operationIdentity, attempt)
        settlingRequestControllers.set(controller, {
          operationIdentity,
          attempt,
        })
      } else {
        abortableRequestControllers.add(controller)
      }
    },
    releaseRequest: (controller, outcome = 'succeeded') => {
      const wasAbortable = abortableRequestControllers.delete(controller)
      const settlingRequest = settlingRequestControllers.get(controller)
      const wasSettling = settlingRequestControllers.delete(controller)
      if (wasSettling && settlingRequest) {
        const { operationIdentity, attempt } = settlingRequest
        if (outcome === 'failed') {
          if (isTerminated) {
            const latestSuccessfulAttempt =
              latestSuccessfulAttempts.get(operationIdentity) ?? 0
            if (attempt > latestSuccessfulAttempt) {
              failedSettlingOperations.set(operationIdentity, attempt)
            }
          }
        } else {
          latestSuccessfulAttempts.set(operationIdentity, attempt)
          const failedAttempt =
            failedSettlingOperations.get(operationIdentity) ?? 0
          if (failedAttempt <= attempt) {
            failedSettlingOperations.delete(operationIdentity)
          }
          // A newer successful attempt supersedes older in-flight attempts for
          // the same logical write. They must not keep terminal teardown open
          // or later reintroduce a failure.
          settlingRequestControllers.forEach(
            (activeRequest, activeController) => {
              if (
                activeRequest.operationIdentity === operationIdentity &&
                activeRequest.attempt < attempt
              ) {
                settlingRequestControllers.delete(activeController)
                activeController.abort()
              }
            }
          )
        }
        resolveSettlingRequestWaiters()
      }
      return wasAbortable || wasSettling
    },
    trackWebSocketClient: (client) => {
      activeWebSocketClients.add(client)
    },
    cancelPendingRequests: ({ abortSettling = false } = {}) => {
      isTerminated = true

      abortableRequestControllers.forEach((controller) => {
        controller.abort()
      })
      abortableRequestControllers.clear()

      if (abortSettling) {
        settlingRequestControllers.forEach((request, controller) => {
          const latestSuccessfulAttempt =
            latestSuccessfulAttempts.get(request.operationIdentity) ?? 0
          if (request.attempt > latestSuccessfulAttempt) {
            failedSettlingOperations.set(
              request.operationIdentity,
              request.attempt
            )
          }
          controller.abort()
        })
        settlingRequestControllers.clear()
        resolveSettlingRequestWaiters()
      }

      activeWebSocketClients.forEach((client) => {
        const disposal = client.dispose()
        if (disposal) {
          void disposal.catch(() => undefined)
        }
      })
      activeWebSocketClients.clear()
    },
    waitForSettlingRequests: (timeoutMs = 10000) => {
      if (settlingRequestControllers.size === 0) {
        return Promise.resolve(getSettlingResult())
      }

      return new Promise<GraphQLSettlingResult>((resolve) => {
        let timeout: ReturnType<typeof setTimeout> | undefined
        const finish = (result: GraphQLSettlingResult) => {
          if (timeout) {
            clearTimeout(timeout)
          }
          settlingRequestWaiters.delete(finish)
          resolve(result)
        }
        settlingRequestWaiters.add(finish)
        timeout = setTimeout(() => {
          const operations = Array.from(
            settlingRequestControllers.values(),
            ({ operationIdentity }) => operationIdentity
          )
          Sentry.logger?.warn(
            'In-flight writes exceeded the session teardown grace period',
            {
              category: 'graphql_request_teardown',
              pendingRequestCount: settlingRequestControllers.size,
              operations,
              timeoutMs,
            }
          )
          settlingRequestWaiters.delete(finish)
          resolve({ status: 'timed-out', operations })
        }, timeoutMs)
      })
    },
  }
}

export class GraphQLRequestCancelledError extends Error {
  constructor(operationName?: string) {
    super(
      operationName
        ? `${GRAPHQL_REQUEST_CANCELLED}: ${operationName}`
        : GRAPHQL_REQUEST_CANCELLED
    )
    this.name = 'GraphQLRequestCancelledError'
  }
}

export class GraphQLMissingAuthorizationError extends Error {
  constructor(operationName?: string) {
    super(
      operationName
        ? `${GRAPHQL_AUTHORIZATION_MISSING}: ${operationName}`
        : GRAPHQL_AUTHORIZATION_MISSING
    )
    this.name = 'GraphQLMissingAuthorizationError'
  }
}

const hasNestedError = (
  error: unknown,
  predicate: (_candidate: { name?: string; message?: string }) => boolean,
  seen = new Set<object>()
): boolean => {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  if (seen.has(error)) {
    return false
  }
  seen.add(error)

  const candidate = error as {
    name?: string
    message?: string
    networkError?: unknown
    cause?: unknown
    originalError?: unknown
  }

  return (
    predicate(candidate) ||
    hasNestedError(candidate.networkError, predicate, seen) ||
    hasNestedError(candidate.cause, predicate, seen) ||
    hasNestedError(candidate.originalError, predicate, seen)
  )
}

export const isGraphQLRequestCancellation = (error: unknown): boolean => {
  if (
    typeof DOMException !== 'undefined' &&
    error instanceof DOMException &&
    error.name === 'AbortError'
  ) {
    return true
  }

  return hasNestedError(
    error,
    ({ name, message }) =>
      name === 'AbortError' ||
      name === 'GraphQLRequestCancelledError' ||
      message?.startsWith(GRAPHQL_REQUEST_CANCELLED) === true
  )
}

export const isGraphQLMissingAuthorizationError = (error: unknown): boolean =>
  hasNestedError(
    error,
    ({ name, message }) =>
      name === 'GraphQLMissingAuthorizationError' ||
      message?.startsWith(GRAPHQL_AUTHORIZATION_MISSING) === true
  )

const getCloseEventContext = (
  closeOrError: unknown
): Record<string, unknown> => {
  if (typeof closeOrError !== 'object' || closeOrError === null) {
    return {}
  }

  const event = closeOrError as Partial<CloseEvent>

  return {
    close_code: event.code,
    close_reason: event.reason,
    was_clean: event.wasClean,
  }
}

const getSocketContext = (socket: unknown): Record<string, unknown> => {
  if (typeof socket !== 'object' || socket === null) {
    return {}
  }

  const websocket = socket as Partial<WebSocket>

  return {
    socket_protocol: websocket.protocol,
    socket_ready_state: websocket.readyState,
  }
}

const getMessageContext = (message: Message): Record<string, unknown> => ({
  message_type: message.type,
  message_id: 'id' in message ? message.id : undefined,
})

const getCloseCode = (closeOrError: unknown): number | undefined => {
  if (typeof closeOrError !== 'object' || closeOrError === null) {
    return undefined
  }

  const { code } = closeOrError as Partial<CloseEvent>

  return typeof code === 'number' ? code : undefined
}

const getOperationIdentity = (
  operationName: string,
  variables: Record<string, unknown>
): string => {
  const input =
    typeof variables.input === 'object' && variables.input !== null
      ? (variables.input as Record<string, unknown>)
      : {}
  const identifierCandidates = [
    input.activity_id,
    input.session_id,
    input.form_id,
    input.id,
    variables.id,
  ]
  const identifier = identifierCandidates.find(
    (candidate) =>
      typeof candidate === 'string' || typeof candidate === 'number'
  )

  return identifier === undefined
    ? operationName
    : `${operationName}:${String(identifier)}`
}

export const createClient = ({
  httpUri,
  wsUri,
  onNetworkError = () => undefined,
  extraLinks = [],
  cacheConfig,
  requestLifecycle = createGraphQLRequestLifecycle(),
}: {
  httpUri: string
  wsUri: string
  onNetworkError?: ErrorLink.ErrorHandler
  extraLinks?: Array<ApolloLink>
  cacheConfig: InMemoryCacheConfig
  requestLifecycle?: GraphQLRequestLifecycle
}): ApolloClient<NormalizedCacheObject> => {
  const httpLink = createHttpLink({ uri: httpUri })

  const requestLifecycleLink = new ApolloLink((operation, forward) => {
    if (requestLifecycle.isTerminated) {
      return new Observable((observer) => {
        observer.error(
          new GraphQLRequestCancelledError(operation.operationName)
        )
      })
    }

    const controller = new AbortController()
    const requestLifecyclePolicy: GraphQLRequestTeardownPolicy =
      operation.getContext().requestLifecyclePolicy === 'settle'
        ? 'settle'
        : 'abort'
    requestLifecycle.trackRequest(
      controller,
      requestLifecyclePolicy,
      getOperationIdentity(operation.operationName, operation.variables)
    )
    let existingSignal: AbortSignal | undefined
    let abortFromExistingSignal: (() => void) | undefined

    operation.setContext(
      ({ fetchOptions = {} }: { fetchOptions?: RequestInit }) => {
        existingSignal = fetchOptions.signal ?? undefined
        if (existingSignal) {
          abortFromExistingSignal = () => {
            controller.abort(existingSignal?.reason)
          }
          if (existingSignal.aborted) {
            abortFromExistingSignal()
          } else {
            existingSignal.addEventListener('abort', abortFromExistingSignal, {
              once: true,
            })
          }
        }

        return {
          fetchOptions: {
            ...fetchOptions,
            signal: controller.signal,
          },
        }
      }
    )

    const releaseRequest = (outcome: GraphQLRequestOutcome = 'succeeded') => {
      if (existingSignal && abortFromExistingSignal) {
        existingSignal.removeEventListener('abort', abortFromExistingSignal)
      }
      return requestLifecycle.releaseRequest(controller, outcome)
    }

    return new Observable((observer) => {
      let hasGraphQLErrors = false
      const subscription = forward(operation).subscribe({
        next: (result) => {
          hasGraphQLErrors =
            hasGraphQLErrors || (result.errors?.length ?? 0) > 0
          observer.next(result)
        },
        error: (error) => {
          releaseRequest(
            requestLifecyclePolicy === 'settle' ? 'failed' : 'succeeded'
          )
          observer.error(
            isGraphQLRequestCancellation(error)
              ? new GraphQLRequestCancelledError(operation.operationName)
              : error
          )
        },
        complete: () => {
          releaseRequest(
            requestLifecyclePolicy === 'settle' && hasGraphQLErrors
              ? 'failed'
              : 'succeeded'
          )
          observer.complete()
        },
      })

      return () => {
        if (requestLifecyclePolicy === 'settle') {
          const requestWasActive = releaseRequest('failed')
          if (requestWasActive && !controller.signal.aborted) {
            controller.abort()
          }
        } else {
          const requestWasActive = releaseRequest()
          if (requestWasActive && !controller.signal.aborted) {
            controller.abort()
          }
        }
        subscription.unsubscribe()
      }
    })
  })

  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: 2000,
      jitter: true,
    },
    attempts: {
      max: 3,
      retryIf: (error) => {
        if (isGraphQLRequestCancellation(error)) {
          return false
        }
        // Only retry on network errors, not GraphQL errors
        // Network errors indicate connectivity issues that might be transient
        return !!error && !error.result
      },
    },
  })

  const errorHandlingLink = onError((response) => {
    if (isGraphQLRequestCancellation(response.networkError)) {
      return
    }

    if (response.networkError) {
      onNetworkError(response)
    }
  })

  const authenticationLink = new ApolloLink((operation, forward) => {
    // why do we need to use sessionStorage here? Can we not pass the token in to this
    // function from the GraphqlWrapper component?
    const accessToken = sessionStorage.getItem('accessToken')

    if (!accessToken) {
      Sentry.logger?.warn('GraphQL request without authorization token', {
        category: 'authentication',
        operation: operation.operationName,
      })
      return new Observable((observer) => {
        observer.error(
          new GraphQLMissingAuthorizationError(operation.operationName)
        )
      })
    }

    operation.setContext({
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    })
    return forward(operation)
  })

  const createWsLink = () => {
    if (isNil(window?.sessionStorage.getItem('accessToken'))) {
      return null
    }
    if (
      window?.sessionStorage.getItem('TEST_DISABLE_SUBSCRIPTIONS') === 'true'
    ) {
      console.info('Disabling GraphQL subscriptions for testing purposes')
      return null
    }

    let activeSocket: WebSocket | undefined
    let keepAliveTimeout: ReturnType<typeof setTimeout> | undefined

    const clearKeepAliveTimeout = () => {
      if (keepAliveTimeout) {
        clearTimeout(keepAliveTimeout)
        keepAliveTimeout = undefined
      }
    }

    const scheduleKeepAliveTimeout = () => {
      clearKeepAliveTimeout()
      keepAliveTimeout = setTimeout(() => {
        logger.warn(
          'GraphQL WebSocket keepalive timeout',
          LogEvent.GRAPHQL_WS_KEEPALIVE_TIMEOUT,
          {
            ws_url: wsUri,
            timeout_ms: GRAPHQL_WS_KEEPALIVE_TIMEOUT_MS,
            close_code: GRAPHQL_WS_KEEPALIVE_TIMEOUT_CODE,
            close_reason: GRAPHQL_WS_KEEPALIVE_TIMEOUT_REASON,
            ...getSocketContext(activeSocket),
          }
        )

        if (activeSocket?.readyState === WebSocket.OPEN) {
          activeSocket.close(
            GRAPHQL_WS_KEEPALIVE_TIMEOUT_CODE,
            GRAPHQL_WS_KEEPALIVE_TIMEOUT_REASON
          )
        }
      }, GRAPHQL_WS_KEEPALIVE_TIMEOUT_MS)
    }

    const websocketClient = createWebsocketClient({
      url: wsUri,
      connectionParams: () => ({
        authToken: window.sessionStorage.getItem('accessToken'),
      }),
      // Only open the socket when there is at least one active subscription
      lazy: true,
      connectionAckWaitTimeout: GRAPHQL_WS_CONNECTION_ACK_TIMEOUT_MS,
      keepAlive: GRAPHQL_WS_KEEPALIVE_INTERVAL_MS,
      // Retry forever with exponential backoff, but wait for online before retrying
      retryAttempts: Infinity,
      shouldRetry: (closeOrError) => {
        if (requestLifecycle.isTerminated) {
          return false
        }

        // Do not retry on auth-related close codes
        const closeCode = getCloseCode(closeOrError)
        const retryRequested = closeCode !== 4401 && closeCode !== 4403

        logger.info(
          `GraphQL WebSocket retry ${retryRequested ? 'requested' : 'blocked'}`,
          LogEvent.GRAPHQL_WS_RETRY_DECISION,
          {
            ws_url: wsUri,
            retry_requested: retryRequested,
            error_message: serializeError(closeOrError),
            ...getCloseEventContext(closeOrError),
          }
        )

        if (!retryRequested) {
          return false
        }

        return true
      },
      retryWait: async (retries) => {
        const wasOffline =
          typeof window !== 'undefined' && !window.navigator.onLine
        // Exponential backoff with jitter (cap at ~16s)
        const base = Math.min(16000, 1000 * Math.pow(2, retries))
        const jitter = Math.floor(Math.random() * 300)
        const delay = base + jitter

        logger.warn(
          'GraphQL WebSocket retry scheduled',
          LogEvent.GRAPHQL_WS_RETRY_WAIT,
          {
            ws_url: wsUri,
            retry_attempt: retries,
            retry_delay_ms: delay,
            browser_online: !wasOffline,
          }
        )

        // If offline, wait until the browser is back online first
        if (wasOffline) {
          await new Promise<void>((resolve) => {
            const onOnline = () => {
              window.removeEventListener('online', onOnline)
              resolve()
            }
            window.addEventListener('online', onOnline)
          })
        }
        await new Promise((r) => setTimeout(r, delay))
      },
      // WebSocket connection event logging. Keep payloads out of logs; frame types
      // and socket state are enough to diagnose subscription lifecycle issues.
      on: {
        connecting: () => {
          logger.info(
            'GraphQL WebSocket connecting',
            LogEvent.GRAPHQL_WS_CONNECTING,
            {
              ws_url: wsUri,
              connection_ack_timeout_ms: GRAPHQL_WS_CONNECTION_ACK_TIMEOUT_MS,
              keepalive_interval_ms: GRAPHQL_WS_KEEPALIVE_INTERVAL_MS,
              keepalive_timeout_ms: GRAPHQL_WS_KEEPALIVE_TIMEOUT_MS,
              browser_online:
                typeof window !== 'undefined'
                  ? window.navigator.onLine
                  : undefined,
              browser_visibility:
                typeof document !== 'undefined'
                  ? document.visibilityState
                  : undefined,
            }
          )
        },
        opened: (socket) => {
          activeSocket = socket as WebSocket
          logger.info('GraphQL WebSocket opened', LogEvent.GRAPHQL_WS_OPENED, {
            ws_url: wsUri,
            ...getSocketContext(socket),
          })
        },
        connected: (socket) => {
          activeSocket = socket as WebSocket
          logger.info(
            'GraphQL WebSocket connected',
            LogEvent.GRAPHQL_WS_CONNECTED,
            {
              ws_url: wsUri,
              ...getSocketContext(socket),
            }
          )
        },
        ping: (received) => {
          logger.info('GraphQL WebSocket ping', LogEvent.GRAPHQL_WS_PING, {
            ws_url: wsUri,
            ping_received: received,
            ...getSocketContext(activeSocket),
          })

          if (!received) {
            scheduleKeepAliveTimeout()
          }
        },
        pong: (received) => {
          logger.info('GraphQL WebSocket pong', LogEvent.GRAPHQL_WS_PONG, {
            ws_url: wsUri,
            pong_received: received,
            ...getSocketContext(activeSocket),
          })

          if (received) {
            clearKeepAliveTimeout()
          }
        },
        message: (message) => {
          logger.info(
            'GraphQL WebSocket message received',
            LogEvent.GRAPHQL_WS_MESSAGE,
            {
              ws_url: wsUri,
              ...getMessageContext(message),
            }
          )
        },
        error: (error) => {
          if (requestLifecycle.isTerminated) {
            return
          }
          logger.error('GraphQL WebSocket error', LogEvent.GRAPHQL_WS_ERROR, {
            ws_url: wsUri,
            error_message: serializeError(error),
            ...getCloseEventContext(error),
          })
        },
        closed: (event) => {
          clearKeepAliveTimeout()
          activeSocket = undefined
          if (requestLifecycle.isTerminated) {
            return
          }
          logger.warn(
            'GraphQL WebSocket disconnected',
            LogEvent.GRAPHQL_WS_DISCONNECTED,
            {
              ws_url: wsUri,
              ...getCloseEventContext(event),
            }
          )
        },
      },
    })

    requestLifecycle.trackWebSocketClient(websocketClient)

    return new GraphQLWsLink(websocketClient)
  }
  const wsLink = createWsLink()

  const isSubscription = ({ query }: { query: DocumentNode }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  }

  const defaultLink = ApolloLink.from([
    authenticationLink,
    requestLifecycleLink,
    ...extraLinks,
    retryLink,
    errorHandlingLink,
    httpLink,
  ])

  const guardedWsLink = wsLink
    ? ApolloLink.from([
        new ApolloLink((operation, forward) => {
          if (requestLifecycle.isTerminated) {
            return new Observable((observer) => {
              observer.error(
                new GraphQLRequestCancelledError(operation.operationName)
              )
            })
          }
          return forward(operation)
        }),
        wsLink,
      ])
    : null

  const link = guardedWsLink
    ? split(isSubscription, guardedWsLink, defaultLink)
    : defaultLink

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    connectToDevTools: process.env.NODE_ENV !== 'production',
    cache: new InMemoryCache(cacheConfig),
    link,
    credentials: 'include',
  })
}
