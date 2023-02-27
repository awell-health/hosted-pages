import { isNil } from 'lodash'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import useSWR from 'swr'
import {
  HostedPagesLinkParams,
  StartHostedActivitySessionParams,
} from '../../../types'
import { LoadingPage } from '../LoadingPage'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type ValidateHostedPagesLinkProps = HostedPagesLinkParams

export const ValidateHostedPagesLink: FC<ValidateHostedPagesLinkProps> = ({
  hostedPagesLinkId,
}): JSX.Element => {
  const router = useRouter()
  const apiRouteQueryParams = `hostedPagesLinkId=${hostedPagesLinkId}`
  const { data } = useSWR(`/api/link/?${apiRouteQueryParams}`, fetcher)

  useEffect(() => {
    if (isNil(data)) {
      return
    }
    const { stakeholderId, pathwayId, hostedPagesLinkId } =
      data as StartHostedActivitySessionParams
    if ([stakeholderId, pathwayId, hostedPagesLinkId].every(Boolean)) {
      const startHostedActivitySessionParams = `stakeholderId=${stakeholderId}&pathwayId=${pathwayId}&hostedPagesLinkId=${hostedPagesLinkId}`
      router.replace(`?${startHostedActivitySessionParams}`)
    }
  }, [data])

  return <LoadingPage title="Authenticating..." />
}
