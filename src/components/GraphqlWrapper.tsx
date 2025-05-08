import { ApolloProvider, ServerError, ServerParseError } from '@apollo/client'
import { ErrorLink } from '@apollo/client/link/error'
import * as Sentry from '@sentry/nextjs'
import React, { FC } from 'react'
import { createClient } from '../services/graphql'
import fragmentTypes from '../types/generated/fragment-types'

const onError: ErrorLink.ErrorHandler = ({ operation, networkError }) => {
  if (networkError) {
    Sentry.captureException(networkError, {
      contexts: {
        graphql: {
          operation: operation.operationName,
          variables: JSON.stringify(operation.variables),
          result:
            networkError.name === 'ServerError'
              ? JSON.stringify((networkError as ServerError).result)
              : undefined,
          statusCode:
            networkError.name === 'ServerError'
              ? JSON.stringify((networkError as ServerError).statusCode)
              : undefined,
          bodyText:
            networkError.name === 'ServerParseError'
              ? JSON.stringify((networkError as ServerParseError).bodyText)
              : undefined,
        },
      },
    })
  }
}

export const GraphqlWrapper: FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const client = createClient({
    httpUri: process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API as string,
    wsUri: process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API_WS as string,
    onNetworkError: onError,
    cacheConfig: {
      possibleTypes: fragmentTypes.possibleTypes,
    },
  })

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}
