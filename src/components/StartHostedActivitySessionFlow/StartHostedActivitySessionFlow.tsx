import { HorizontalSpinner, Text } from '@awell_health/ui-library'
import { isNil } from 'lodash'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import useSWR from 'swr'
import { StartHostedActivitySessionParams } from '../../../types'
import { ErrorPage } from '../ErrorPage'
import { LoadingPage } from '../LoadingPage'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type StartHostedActivitySessionFlowProps = StartHostedActivitySessionParams

export const StartHostedActivitySessionFlow: FC<
  StartHostedActivitySessionFlowProps
> = ({ hostedPagesLinkId }): JSX.Element => {
  const router = useRouter()

  const { data, error } = useSWR(
    `/api/startActivitySessionUsingHostedPagesLink/${hostedPagesLinkId}`,
    fetcher
  )
  useEffect(() => {
    if (!isNil(data?.sessionId)) {
      router.replace(`../?sessionId=${data?.sessionId}`)
    }
  }, [data])

  if (error) {
    return <ErrorPage title="Authentication failed" />
  }

  return <LoadingPage title="Fetching activities" />
}
