import { ApolloProvider, ServerError, ServerParseError } from '@apollo/client'
import { ErrorLink } from '@apollo/client/link/error'
import * as Sentry from '@sentry/nextjs'
import React, { FC, useCallback, useMemo } from 'react'
import { createClient } from '../services/graphql'
import fragmentTypes from '../types/generated/fragment-types'
import { useNetworkError } from '../contexts/NetworkErrorContext'
import { HostedSessionError, captureHostedSessionError } from '../utils/errors'

interface GraphqlWrapperProps {
  children?: React.ReactNode
}

const GraphqlWrapperInner: FC<GraphqlWrapperProps> = ({ children }) => {
  const { incrementNetworkErrorCount, setNetworkError } = useNetworkError()

  const onNetworkError: ErrorLink.ErrorHandler = useCallback(
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

          // Log network connectivity error
          // organization_slug will be automatically included from Sentry scope
          // if session was previously loaded (set by useHostedSession useEffect)
          Sentry.logger?.error('Network connectivity error detected', {
            category: 'network',
            operation: operation.operationName,
            error: networkError.message,
            errorMessage: networkError.message,
            errorName: networkError.name,
            errorStack: networkError.stack,
          })
        }

        // organization_slug will be automatically included from Sentry scope
        // if session was previously loaded (set by useHostedSession useEffect)
        // Capture in Sentry with enhanced context using custom error class
        const hostedSessionError = new HostedSessionError(
          `${networkError.message || 'GraphQL network error - '} - ${
            operation.operationName
          }`,
          {
            errorType: isNetworkConnectivityError
              ? 'NETWORK_CONNECTIVITY_ERROR'
              : 'GRAPHQL_ERROR',
            operation: operation.operationName,
            originalError: networkError,
            tags: {
              graphql_operation: operation.operationName,
              error_type: isNetworkConnectivityError
                ? 'network_connectivity'
                : 'graphql_error',
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
                    ? JSON.stringify(
                        (networkError as ServerParseError).bodyText
                      )
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
          }
        )
        captureHostedSessionError(hostedSessionError)
      }
    },
    [incrementNetworkErrorCount, setNetworkError]
  )

  const client = useMemo(
    () =>
      createClient({
        httpUri: process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API as string,
        wsUri: process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API_WS as string,
        onNetworkError: onNetworkError,
        cacheConfig: {
          possibleTypes: fragmentTypes.possibleTypes,
        },
      }),
    [onNetworkError]
  )

  return <ApolloProvider client={client}>{children}</ApolloProvider>
}

export const GraphqlWrapper: FC<GraphqlWrapperProps> = ({ children }) => {
  return <GraphqlWrapperInner>{children}</GraphqlWrapperInner>
}
