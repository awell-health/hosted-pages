import { ApolloCache, FetchResult, MutationUpdaterFn } from '@apollo/client'
import { DocumentNode } from 'graphql'
import { mergeWith } from 'lodash'

export const createApolloCacheUpdate = <
  MutationType,
  QueryType,
  TVariables = any
>({
  query,
  variables,
  updateFunction,
}: {
  query: DocumentNode
  variables: TVariables
  updateFunction: ({
    result,
    query,
  }: {
    result: FetchResult<MutationType>
    query: QueryType
  }) => QueryType
}): MutationUpdaterFn<MutationType> => {
  const update = (
    cache: ApolloCache<MutationType>,
    result: FetchResult<MutationType>
  ) => {
    const cachedQuery = cache.readQuery<QueryType, TVariables>({
      query,
      variables,
    }) as QueryType
    const updatedCachedQuery = updateFunction({ result, query: cachedQuery })
    cache.writeQuery({ query, variables, data: updatedCachedQuery })
  }
  return update
}

// See https://newbedev.com/typescript-deep-keyof-of-a-nested-object
type PathTree<T> = {
  [P in keyof T]: T[P] extends object ? [P, ...Path<T[P]>] : [P]
}

type Path<T> = PathTree<T>[keyof PathTree<T>]

/**
 * Convenience function to update a query without having to manually
 * copy the query object and put the new value in the right place.
 * Why not use lodash or ramda directly ? Typing lenses in ramda
 * is a pain in the arse, and lodash doesn't have a typed function
 * that can updated a nested property.
 * This function has the benefit of being typed: the path is automatically
 * infered and validated by typescript depending on the query type.
 * The value type isn't inferred though so it still needs to be explicitly
 * defined by the calling code.
 */
export const updateQuery = <QueryType, ValueType>(
  query: QueryType,
  path: Path<QueryType>,
  value: ValueType
): QueryType => {
  const propertyPath = path as Array<string>
  // Build an object that can be used with assign to update the query.
  // Example:
  // ```
  // const path = ['some', 'nested', 'property']
  // const value = ['a', 'list', 'of', 'values']
  // const updateObj = {
  //   some: {
  //     nested: {
  //       property: ['a', 'list', 'of', 'values']
  //     }
  //   }
  // }
  const updateObj = propertyPath
    .reverse()
    .reduce((agg: any, currentProperty) => {
      return {
        [currentProperty]: agg,
      }
    }, value)

  // By default lodash merges array, which makes it impossible
  // to remove array items. This customiser overrides that behaviour
  // to use only the source value when it is an array.
  // See https://lodash.com/docs/4.17.15#mergeWith
  const replaceArray = (objValue: any, srcValue: any) => {
    if (Array.isArray(srcValue)) {
      return srcValue
    }
    return undefined
  }

  return mergeWith({}, query, updateObj, replaceArray)
}
