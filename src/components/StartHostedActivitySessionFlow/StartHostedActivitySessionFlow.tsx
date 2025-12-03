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
import * as Sentry from '@sentry/nextjs'

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
      Sentry.logger.info('Navigation: Redirecting to hosted session', {
        category: 'navigation',
        hostedPagesLinkId,
        sessionUrl: data?.sessionUrl,
      })
      const { sessionUrl } = data
      window.location.href = sessionUrl
    }
  }, [data, router])

  useEffect(() => {
    if (data?.error) {
      Sentry.logger.error('Error with hosted activity link', {
        category: 'hosted_activity_error',
        hostedPagesLinkId,
        error: data.error,
        track_id,
        activity_id,
      })
    }
  }, [data?.error, hostedPagesLinkId, track_id, activity_id])

  if (data?.error) {
    return (
      <ErrorPage
        title={`${t('link_page.loading_error')} ${data.error}`}
        onRetry={retry}
      />
    )
  }

  return <LoadingPage showLogoBox={true} />
}
