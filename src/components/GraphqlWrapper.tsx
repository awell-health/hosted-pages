import { ApolloProvider } from '@apollo/client'
import { ErrorLink } from '@apollo/client/link/error'
import { createClient } from '../services/graphql'
import React, { FC } from 'react'
import fragmentTypes from '../types/generated/fragment-types'
import * as Sentry from '@sentry/nextjs'

const onError: ErrorLink.ErrorHandler = ({ operation, networkError }) => {
  if (networkError) {
    Sentry.captureException(networkError, {
      contexts: {
        graphql: {
          operation: operation.operationName,
          variables: JSON.stringify(operation.variables.input),
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
