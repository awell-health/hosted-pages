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
import { WebSocketLink } from '@apollo/client/link/ws'
import { getMainDefinition } from '@apollo/client/utilities'

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
    const accessToken = localStorage.getItem('accessToken')

    operation.setContext({
      headers: {
        authorization: accessToken ? `Bearer ${accessToken}` : '',
      },
    })
    return forward(operation)
  })

  const wsLink =
    typeof window !== 'undefined'
      ? new WebSocketLink({
          uri: wsUri,
          options: {
            reconnect: true,
            connectionParams: {
              authToken: window.localStorage.getItem('accessToken'),
            },
          },
        })
      : null

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
