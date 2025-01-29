import { ApolloError } from '@apollo/client'
import { isNil } from 'lodash'

export const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (error instanceof ApolloError) {
    console.log('#####################################')
    console.log('#####################################')
    console.log('error', error)
    console.log('#####################################')
    console.log('#####################################')
    const errorMessage = error.graphQLErrors
      .map((err: any) =>
        !isNil(err?.extensions?.data?.dataPointValueType) &&
        !isNil(err?.extensions?.data?.value)
          ? `Invalid ${err.extensions.data.dataPointValueType}: ${err.extensions.data.value}.`
          : err.message
      )
      .join(' ')
    return `${defaultMessage}\n${errorMessage}`
  }
  return defaultMessage
}
