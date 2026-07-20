import { useGetExtensionActivityDetailsQuery } from './types'
import type { ExtensionActivityRecord } from './types'
import { isNil } from 'lodash'
import {
  isGraphQLMissingAuthorizationError,
  isGraphQLRequestCancellation,
} from '../../services/graphql'
import { HostedSessionStatus } from '../../types/generated/types-orchestration'
import { useHostedSession } from '../useHostedSession'

interface UseExtensionActivityHook {
  loading: boolean
  extensionActivityDetails?: ExtensionActivityRecord
  error?: string
  refetch?: () => void
}

export const useExtensionActivity = (id: string): UseExtensionActivityHook => {
  const { session } = useHostedSession()

  const { data, loading, error, refetch } = useGetExtensionActivityDetailsQuery(
    {
      variables: {
        id,
      },
      nextFetchPolicy: 'cache-first',
      skip: session?.status !== HostedSessionStatus.Active,
    }
  )

  if (
    !isNil(error) &&
    !isGraphQLRequestCancellation(error) &&
    !isGraphQLMissingAuthorizationError(error)
  ) {
    return { loading: false, error: error.message, refetch }
  }
  if (loading) {
    return { loading: true }
  }

  return {
    loading: false,
    extensionActivityDetails: data?.extensionActivityRecord.record,
    refetch,
  }
}
