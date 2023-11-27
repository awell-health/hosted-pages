import { isNil } from 'lodash'
import { useRouter } from 'next/router'
import { FC, useEffect } from 'react'
import useSWR from 'swr'
import {
  StartHostedActivitySessionParams,
  StartHostedActivitySessionPayload,
} from '../../../types'
import { ErrorPage } from '../ErrorPage'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import classes from './startHostedActivitySessionFlow.module.css'
import { addSentryBreadcrumb } from '../../services/ErrorReporter'
import { BreadcrumbCategory } from '../../services/ErrorReporter/addSentryBreadcrumb'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type StartHostedActivitySessionFlowProps = StartHostedActivitySessionParams

export const StartHostedActivitySessionFlow: FC<
  StartHostedActivitySessionFlowProps
> = ({ hostedPagesLinkId }): JSX.Element => {
  const router = useRouter()
  const { t } = useTranslation()

  const { data } = useSWR<StartHostedActivitySessionPayload>(
    `/api/startHostedActivitySessionViaHostedPagesLink/${hostedPagesLinkId}`,
    fetcher
  )

  const retry = () => {
    window.location.reload()
  }

  useEffect(() => {
    if (!isNil(data) && !isNil(data?.sessionUrl)) {
      addSentryBreadcrumb({
        category: BreadcrumbCategory.NAVIGATION,
        data: {
          hostedPagesLinkId,
          sessionUrl: data?.sessionUrl,
          message: 'Redirecting to hosted session',
        },
      })
      const { sessionUrl } = data
      window.location.href = sessionUrl
    }
  }, [data, router])

  if (data?.error) {
    addSentryBreadcrumb({
      category: BreadcrumbCategory.HOSTED_ACTIVITY_ERROR,
      data: { hostedPagesLinkId },
    })

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
