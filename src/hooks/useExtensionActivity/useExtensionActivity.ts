import { useTranslation } from 'react-i18next'
import { useGetExtensionActivityDetailsQuery } from './types'
import type { ExtensionActivityDetails } from './types'
import { isNil } from 'lodash'
import { useEffect } from 'react'

interface UseExtensionActivityHook {
  loading: boolean
  extensionActivityDetails?: ExtensionActivityDetails
}

export const useExtensionActivity = (id: string): UseExtensionActivityHook => {
  const { t } = useTranslation()

  const { data, loading, error, refetch } = useGetExtensionActivityDetailsQuery(
    {
      variables: {
        id,
      },
      nextFetchPolicy: 'cache-first',
    }
  )

  useEffect(() => {
    void refetch()
  }, [id])

  if (!isNil(error)) {
    return { loading: false }
  }
  if (loading) {
    return { loading: true }
  }

  return {
    loading: false,
    extensionActivityDetails: data?.pluginActivityRecord.record,
  }
}
