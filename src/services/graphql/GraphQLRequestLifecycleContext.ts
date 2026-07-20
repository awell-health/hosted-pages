import { createContext, useContext } from 'react'
import type { GraphQLRequestLifecycle } from './apollo-client'

export const GraphQLRequestLifecycleContext = createContext<
  GraphQLRequestLifecycle | undefined
>(undefined)

export const useGraphQLRequestLifecycle = (): GraphQLRequestLifecycle => {
  const requestLifecycle = useContext(GraphQLRequestLifecycleContext)

  if (!requestLifecycle) {
    throw new Error(
      'useGraphQLRequestLifecycle must be used within GraphqlWrapper'
    )
  }

  return requestLifecycle
}
