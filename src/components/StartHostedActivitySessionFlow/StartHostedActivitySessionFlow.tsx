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
import { addSentryBreadcrumb } from '../../services/ErrorReporter'
import { BreadcrumbCategory } from '../../services/ErrorReporter/addSentryBreadcrumb'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type StartHostedActivitySessionFlowProps = StartHostedActivitySessionParams

export const StartHostedActivitySessionFlow: FC<
  StartHostedActivitySessionFlowProps
> = ({ hostedPagesLinkId, track_id, activity_id }): JSX.Element => {
  const router = useRouter()
  const { t } = useTranslation()
  const queryParams = new URLSearchParams()
  if (!isNil(track_id) || !isNil(activity_id)) {
    if (!isNil(track_id)) {
      queryParams.set('track_id', track_id)
    }
    if (!isNil(activity_id)) {
      queryParams.set('activity_id', activity_id)
    }
  }
  const key = `/api/startHostedActivitySessionViaHostedPagesLink/${hostedPagesLinkId}?${queryParams.toString()}`
  const { data } = useSWR<StartHostedActivitySessionPayload>(key, fetcher)

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
      <ErrorPage
        title={`${t('link_page.loading_error')} ${data.error}`}
        onRetry={retry}
      />
    )
  }

  return <LoadingPage showLogoBox={true} />
}
