import { ApolloError } from '@apollo/client'

export const getErrorMessage = (error: any, defaultMessage: string): string => {
  if (error instanceof ApolloError) {
    return error.message
  }
  return defaultMessage
}
