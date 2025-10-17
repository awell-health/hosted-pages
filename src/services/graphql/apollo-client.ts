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
        /*
        on: {
          connected: () => {
            infoLog(
              { msg: 'GraphQL WebSocket connected' },
              LogEvent.GRAPHQL_WS_CONNECTED
            )
          },
          error: (error) => {
            errorLog(
              { msg: 'GraphQL WebSocket error', error },
              JSON.stringify(error),
              LogEvent.GRAPHQL_WS_ERROR
            )
          },
          closed: () => {
            infoLog(
              { msg: 'GraphQL WebSocket disconnected' },
              LogEvent.GRAPHQL_WS_DISCONNECTED
            )
          },
        },
        */
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
