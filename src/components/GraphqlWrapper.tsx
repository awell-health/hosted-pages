import { ApolloProvider, ServerError, ServerParseError } from '@apollo/client'
import { ErrorLink } from '@apollo/client/link/error'
import * as Sentry from '@sentry/nextjs'
import React, { FC, useCallback, useMemo } from 'react'
import { createClient } from '../services/graphql'
import fragmentTypes from '../types/generated/fragment-types'
import { useNetworkError } from '../contexts/NetworkErrorContext'

interface GraphqlWrapperProps {
  children?: React.ReactNode
}

const GraphqlWrapperInner: FC<GraphqlWrapperProps> = ({ children }) => {
  const { incrementNetworkErrorCount, setNetworkError } = useNetworkError()

  const onError: ErrorLink.ErrorHandler = useCallback(
    ({ operation, networkError }) => {
      if (networkError) {
        // Check if this is a network connectivity error (fetch failed)
        const isNetworkConnectivityError =
          networkError.message === 'Failed to fetch' ||
          networkError.message.includes('NetworkError') ||
          networkError.message.includes('Network request failed')

        if (isNetworkConnectivityError) {
          incrementNetworkErrorCount()
          setNetworkError(true)

          // Add breadcrumb for network error
          Sentry.addBreadcrumb({
            category: 'network',
            message: 'Network connectivity error detected',
            level: 'error',
            data: {
              operation: operation.operationName,
              errorMessage: networkError.message,
            },
          })
        }

        // Capture in Sentry with enhanced context
        Sentry.captureException(networkError, {
          level: isNetworkConnectivityError ? 'warning' : 'error',
          tags: {
            graphql_operation: operation.operationName,
            error_type: isNetworkConnectivityError
              ? 'network_connectivity'
              : 'graphql_network',
          },
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
            network: {
              online:
                typeof navigator !== 'undefined' ? navigator.onLine : true,
              connection:
                typeof navigator !== 'undefined' && 'connection' in navigator
                  ? JSON.stringify(
                      (navigator as any).connection || {
                        effectiveType: 'unknown',
                      }
                    )
                  : 'unknown',
            },
          },
        })
      }
    },
    [incrementNetworkErrorCount, setNetworkError]
  )

  const client = useMemo(
    () =>
      createClient({
        httpUri: process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API as string,
        wsUri: process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API_WS as string,
        onNetworkError: onError,
        cacheConfig: {
          possibleTypes: fragmentTypes.possibleTypes,
        },
      }),
    [onError]
  )

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export const GraphqlWrapper: FC<GraphqlWrapperProps> = ({ children }) => {
  return <GraphqlWrapperInner>{children}</GraphqlWrapperInner>
}
