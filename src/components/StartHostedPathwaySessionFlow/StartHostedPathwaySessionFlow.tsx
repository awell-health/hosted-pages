import { isNil } from 'lodash'
import { FC, useEffect } from 'react'
import useSWR from 'swr'
import { ErrorPage } from '../ErrorPage'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import {
  StartHostedCareflowSessionParams,
  StartHostedCareflowSessionPayload,
} from '../../../pages/api/startHostedPathwaySessionFromLink/[hostedPagesLinkId]'
import { addSentryBreadcrumb } from '../../services/ErrorReporter'
import { BreadcrumbCategory } from '../../services/ErrorReporter/addSentryBreadcrumb'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

type StartHostedCareflowSessionFlowProps = StartHostedCareflowSessionParams

export const StartHostedCareflowSessionFlow: FC<
  StartHostedCareflowSessionFlowProps
> = ({ hostedPagesLinkId, patient_identifier }): JSX.Element => {
  const { t } = useTranslation()
  const startSessionUrl = `/api/startHostedPathwaySessionFromLink/${hostedPagesLinkId}`
  const queryParams = isNil(patient_identifier)
    ? ''
    : `?patient_identifier=${patient_identifier}`
  const key = `${startSessionUrl}${queryParams}`
  const { data } = useSWR<StartHostedCareflowSessionPayload>(key, fetcher)

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
  }, [data])

  if (data?.error) {
    addSentryBreadcrumb({
      category: BreadcrumbCategory.HOSTED_PAGES_LINK_ERROR,
      data: { hostedPagesLinkId, message: data.error },
    })
    return <ErrorPage title={`${t('link_page.loading_error')} ${data.error}`} />
  }

  return <LoadingPage showLogoBox={true} />
}
