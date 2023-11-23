import { isNil } from 'lodash'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import useSWR from 'swr'
import { ErrorPage } from '../ErrorPage'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import classes from './StartHostedPathwaySessionFlow.module.css'
import {
  StartHostedCareflowSessionParams,
  StartHostedCareflowSessionPayload,
} from '../../../pages/api/startHostedPathwaySessionFromLink/[hostedPagesLinkId]'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type StartHostedCareflowSessionFlowProps = StartHostedCareflowSessionParams

export const StartHostedCareflowSessionFlow: FC<
  StartHostedCareflowSessionFlowProps
> = ({ hostedPagesLinkId }): JSX.Element => {
  const router = useRouter()
  const { t } = useTranslation()

  const { data, error } = useSWR<StartHostedCareflowSessionPayload>(
    `/api/startHostedPathwaySessionFromLink/${hostedPagesLinkId}`,
    fetcher
  )

  const retry = () => {
    window.location.reload()
  }

  useEffect(() => {
    if (!isNil(data) && !isNil(data?.sessionUrl)) {
      const { sessionUrl } = data
      window.location.href = sessionUrl
    }
  }, [data, router])

  if (error) {
    return (
      <div className={classes.container}>
        <ErrorPage title={t('link_page.loading_error')} onRetry={retry} />
      </div>
    )
  }

  return (
    <div className={classes.container}>
      <LoadingPage title={t('link_page.loading')} />
    </div>
  )
}
