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
import { isNil } from 'lodash'

export const createClient = ({
  httpUri,
  wsUri,
  onNetworkError = () => undefined,
  extraLinks = [],
  cacheConfig,
}: //infoLog,
//errorLog,
{
  httpUri: string
  wsUri: string
  onNetworkError?: ErrorLink.ErrorHandler
  extraLinks?: Array<ApolloLink>
  cacheConfig: InMemoryCacheConfig
  //infoLog: (message: {}, event: LogEvent) => void
  //errorLog: (message: {}, error: string | {}, event: LogEvent) => void
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
        // Only retry on network errors, not GraphQL errors
        // Network errors indicate connectivity issues that might be transient
        return !!error && !error.result
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
    return new GraphQLWsLink(
      createWebsocketClient({
        url: wsUri,
        connectionParams: {
          authToken: window.sessionStorage.getItem('accessToken'),
        },
        // Only open the socket when there is at least one active subscription
        lazy: true,
        // Retry forever with exponential backoff, but wait for online before retrying
        retryAttempts: Infinity,
        shouldRetry: (closeOrError) => {
          // Do not retry on auth-related close codes
          if (typeof (closeOrError as any)?.code === 'number') {
            const code = (closeOrError as any).code as number
            if (code === 4401 || code === 4403) return false
          }
          return true
        },
        retryWait: async (retries) => {
          // If offline, wait until the browser is back online first
          if (typeof window !== 'undefined' && !window.navigator.onLine) {
            await new Promise<void>((resolve) => {
              const onOnline = () => {
                window.removeEventListener('online', onOnline)
                resolve()
              }
              window.addEventListener('online', onOnline)
            })
          }
          // Exponential backoff with jitter (cap at ~16s)
          const base = Math.min(16000, 1000 * Math.pow(2, retries))
          const jitter = Math.floor(Math.random() * 300)
          await new Promise((r) => setTimeout(r, base + jitter))
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
    retryLink,
    errorHandlingLink,
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
