import { isNil } from 'lodash'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import useSWR from 'swr'
import { StartHostedActivitySessionParams } from '../../../types'
import { ErrorPage } from '../ErrorPage'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import classes from './startHostedActivitySessionFlow.module.css'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type StartHostedActivitySessionFlowProps = StartHostedActivitySessionParams

export const StartHostedActivitySessionFlow: FC<
  StartHostedActivitySessionFlowProps
> = ({ hostedPagesLinkId }): JSX.Element => {
  const router = useRouter()
  const { t } = useTranslation()

  const { data, error } = useSWR(
    `/api/startHostedActivitySessionViaHostedPagesLink/${hostedPagesLinkId}`,
    fetcher
  )

  const retry = () => {
    window.location.reload()
  }

  useEffect(() => {
    if (!isNil(data?.sessionId)) {
      router.replace(`../?sessionId=${data?.sessionId}`)
    }
  }, [data])

  if (error || !isNil(data?.error)) {
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