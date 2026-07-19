import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  DocumentNode,
  InMemoryCache,
  InMemoryCacheConfig,
  NormalizedCacheObject,
  split,
} from '@apollo/client'
import { ErrorLink, onError } from '@apollo/client/link/error'
import { RetryLink } from '@apollo/client/link/retry'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient as createWebsocketClient } from 'graphql-ws'
import type { Message } from 'graphql-ws'
import { isNil } from 'lodash'
import * as Sentry from '@sentry/nextjs'
import { serializeError } from '../../utils/errors'
import { LogEvent, logger } from '../../utils/logging'

const GRAPHQL_WS_KEEPALIVE_INTERVAL_MS = 10000
const GRAPHQL_WS_KEEPALIVE_TIMEOUT_MS = 5000
const GRAPHQL_WS_KEEPALIVE_TIMEOUT_CODE = 4408
const GRAPHQL_WS_KEEPALIVE_TIMEOUT_REASON = 'Request Timeout'
const GRAPHQL_WS_CONNECTION_ACK_TIMEOUT_MS = 10000

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

export const createClient = ({
  httpUri,
  wsUri,
  onNetworkError = () => undefined,
  extraLinks = [],
  cacheConfig,
}: {
  httpUri: string
  wsUri: string
  onNetworkError?: ErrorLink.ErrorHandler
  extraLinks?: Array<ApolloLink>
  cacheConfig: InMemoryCacheConfig
}): ApolloClient<NormalizedCacheObject> => {
  const httpLink = createHttpLink({ uri: httpUri })

  const retryLink = new RetryLink({
    delay: {
      initial: 300,
      max: 2000,
      jitter: true,
    },
    attempts: {
      max: 3,
      retryIf: (error) => {
        if (!error) return false
        // Retry on network connectivity errors (no response received)
        if (!error.result) return true
        // Retry on server errors (5xx) which are often transient
        if (error.statusCode >= 500) return true
        return false
      },
    },
  })

  const errorHandlingLink = onError((response) => {
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
    }

    operation.setContext({
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : '',
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

    return new GraphQLWsLink(
      createWebsocketClient({
        url: wsUri,
        connectionParams: {
          authToken: window.sessionStorage.getItem('accessToken'),
        },
        // Only open the socket when there is at least one active subscription
        lazy: true,
        connectionAckWaitTimeout: GRAPHQL_WS_CONNECTION_ACK_TIMEOUT_MS,
        keepAlive: GRAPHQL_WS_KEEPALIVE_INTERVAL_MS,
        // Retry forever with exponential backoff, but wait for online before retrying
        retryAttempts: Infinity,
        shouldRetry: (closeOrError) => {
          // Do not retry on auth-related close codes
          const closeCode = getCloseCode(closeOrError)
          const retryRequested = closeCode !== 4401 && closeCode !== 4403

          logger.info(
            `GraphQL WebSocket retry ${
              retryRequested ? 'requested' : 'blocked'
            }`,
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
            logger.info(
              'GraphQL WebSocket opened',
              LogEvent.GRAPHQL_WS_OPENED,
              {
                ws_url: wsUri,
                ...getSocketContext(socket),
              }
            )
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
            logger.error('GraphQL WebSocket error', LogEvent.GRAPHQL_WS_ERROR, {
              ws_url: wsUri,
              error_message: serializeError(error),
              ...getCloseEventContext(error),
            })
          },
          closed: (event) => {
            clearKeepAliveTimeout()
            activeSocket = undefined
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
    )
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
    ...extraLinks,
    errorHandlingLink,
    retryLink,
    httpLink,
  ])

  const link = wsLink ? split(isSubscription, wsLink, defaultLink) : defaultLink

  return new ApolloClient({
    ssrMode: typeof window === 'undefined',
    connectToDevTools: process.env.NODE_ENV !== 'production',
    cache: new InMemoryCache(cacheConfig),
    link,
    credentials: 'include',
  })
}
