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
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient as createWebsocketClient } from 'graphql-ws'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { isNil } from 'lodash'

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

  const errorHandlingLink = onError((response) => {
    if (response.networkError) {
      onNetworkError(response)
    }
  })

  const authenticationLink = new ApolloLink((operation, forward) => {
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
    httpLink,
  ])

  const link = wsLink ? split(isSubscription, wsLink, defaultLink) : defaultLink

  return new ApolloClient({
    ssrMode: true,
    connectToDevTools: process.env.NODE_ENV !== 'production',
    cache: new InMemoryCache(cacheConfig),
    link,
    credentials: 'include',
  })
}
