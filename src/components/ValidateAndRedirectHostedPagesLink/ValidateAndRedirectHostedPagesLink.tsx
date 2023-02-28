import { isNil } from 'lodash'
import { useRouter } from 'next/router'
import { FC, useEffect, useState } from 'react'
import useSWR from 'swr'
import {
  HostedPagesLinkParams,
  StartHostedActivitySessionParams,
} from '../../../types'
import { LoadingPage } from '../LoadingPage'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type ValidateHostedPagesLinkProps = HostedPagesLinkParams

export const ValidateAndRedirectHostedPagesLink: FC<
  ValidateHostedPagesLinkProps
> = ({ hostedPagesLinkId }): JSX.Element => {
  const router = useRouter()
  const { data } = useSWR(`/api/hostedPagesLink/${hostedPagesLinkId}`, fetcher)

  const [error, setError] = useState<any>(undefined)

  useEffect(() => {
    if (isNil(data)) {
      return
    }
    if (!isNil(data.error)) {
      setError(data.error)
      return
    }
    const { stakeholderId, pathwayId, hostedPagesLinkId } =
      data as StartHostedActivitySessionParams
    if ([stakeholderId, pathwayId, hostedPagesLinkId].every(Boolean)) {
      const startHostedActivitySessionParams = `stakeholderId=${stakeholderId}&pathwayId=${pathwayId}&hostedPagesLinkId=${hostedPagesLinkId}`
      router.replace(`?${startHostedActivitySessionParams}`)
    }
  }, [data])

  if (error) {
    return <LoadingPage title="Authentication failed" />
  }

  return <LoadingPage title="Authenticating..." />
}
