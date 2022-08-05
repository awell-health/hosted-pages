import {
  ApolloClient,
  ApolloLink,
  createHttpLink,
  InMemoryCache,
  InMemoryCacheConfig,
  NormalizedCacheObject,
} from '@apollo/client'
import { ErrorLink, onError } from '@apollo/client/link/error'

export const createClient = ({
  httpUri,
  onNetworkError = () => undefined,
  extraLinks = [],
  cacheConfig,
}: {
  httpUri: string
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

  const link = ApolloLink.from([
    authenticationLink,
    ...extraLinks,
    errorHandlingLink,
    httpLink,
  ])

  return new ApolloClient({
    connectToDevTools: process.env.NODE_ENV !== 'production',
    cache: new InMemoryCache(cacheConfig),
    link,
    credentials: 'include',
  })
}
