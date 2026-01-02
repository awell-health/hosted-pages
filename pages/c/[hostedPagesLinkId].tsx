import type { GetServerSideProps, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ThemeProvider } from '@awell-health/ui-library'
import { AWELL_BRAND_COLOR } from '../../src/config'
import { validateLocale } from '../../src/utils'
import { startHostedPathwaySession } from '../../lib'
import { ErrorPage } from '../../src/components/ErrorPage'
import { useTranslation } from 'next-i18next'
import * as Sentry from '@sentry/nextjs'
import { extractTrackingParams } from '../../src/utils/extractTrackingParams'

/**
 * Purpose of this page is to support shortened URLs i.e. 'goto.awell.health/c/<hostedCareflowLinkId>?patient_identifier=system|id'
 * Uses server-side rendering to create session and redirect immediately.
 */
const HostedCareflowLink: NextPage<{ error?: string }> = ({ error }) => {
  const { t } = useTranslation()

  const retry = () => {
    window.location.reload()
  }

  // This should never be reached in SSR mode without error since server redirects on success
  // But kept as fallback for edge cases - show error page to give user option to retry
  const errorTitle = error
    ? `${t('link_page.loading_error')} ${error}`
    : t('link_page.loading_error')

  return (
    <ThemeProvider accentColor={AWELL_BRAND_COLOR}>
      <ErrorPage title={errorTitle} onRetry={retry} />
    </ThemeProvider>
  )
}

export default HostedCareflowLink

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { locale, query } = context
  const validatedLocale = validateLocale(locale || 'en')

  const tracking = extractTrackingParams(query)

  const params = {
    hostedPagesLinkId: query.hostedPagesLinkId as string,
    patient_identifier: query.patient_identifier as string | undefined,
    track_id: query.track_id as string | undefined,
    activity_id: query.activity_id as string | undefined,
    ...(tracking && { tracking }),
  }

  const result = await startHostedPathwaySession(params)

  if ('error' in result) {
    // Error already logged and reported to Sentry in startHostedPathwaySession
    return {
      props: {
        ...(await serverSideTranslations(validatedLocale, ['common'])),
        error: result.error,
      },
    }
  }

  // Log successful redirect server-side
  Sentry.logger?.info('Navigation: Redirecting to hosted session', {
    category: 'navigation',
    hostedPagesLinkId: params.hostedPagesLinkId,
    sessionUrl: result.sessionUrl,
    organization_slug: result.organization_slug,
  })

  // Redirect server-side
  return {
    redirect: {
      destination: result.sessionUrl,
      permanent: false,
    },
  }
}
