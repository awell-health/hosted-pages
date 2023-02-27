import { HorizontalSpinner, Text } from '@awell_health/ui-library'
import { isNil } from 'lodash'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import useSWR from 'swr'
import { StartHostedActivitySessionParams } from '../../../types'
import { LoadingPage } from '../LoadingPage'
import classes from './startHostedActivitySessionFlow.module.css'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type StartHostedActivitySessionFlowProps = StartHostedActivitySessionParams

export const StartHostedActivitySessionFlow: FC<
  StartHostedActivitySessionFlowProps
> = ({ stakeholderId, pathwayId, hostedPagesLinkId }): JSX.Element => {
  const router = useRouter()
  const apiRouteQueryParams = `stakeholderId=${stakeholderId}&pathwayId=${pathwayId}&hostedPagesLinkId=${hostedPagesLinkId}`
  const { data, error } = useSWR(
    `/api/startHostedActivitySession/?${apiRouteQueryParams}`,
    fetcher
  )

  useEffect(() => {
    if (!isNil(data?.session_id)) {
      router.replace(`?sessionId=${data?.session_id}`)
    }
  }, [data])

  return <LoadingPage title="Fetching activities" />
}
