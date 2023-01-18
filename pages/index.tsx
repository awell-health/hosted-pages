/* eslint-disable react-hooks/exhaustive-deps */
import type { NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useHostedSession } from '../src/hooks/useHostedSession'
import { ActivityContainer, LoadingPage, ErrorPage } from '../src/components'
import {
  ThemeProvider,
  HostedPageLayout,
  Modal,
  Button,
} from '@awell_health/ui-library'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import awell_logo from '../src/assets/logo.svg'
import { useEffect, useState } from 'react'
import { HostedSessionStatus } from '../src/types/generated/types-orchestration'
import { defaultTo, isNil } from 'lodash'
import { useLocalStorage } from '../src/hooks/useLocalStorage'
import Head from 'next/head'
import { addSentryBreadcrumb } from '../src/services/ErrorReporter'
import { BreadcrumbCategory } from '../src/services/ErrorReporter/addSentryBreadcrumb'

const AWELL_BRAND_COLOR = '#004ac2'

const Home: NextPage = () => {
  const { t } = useTranslation()
  const { loading, session, branding, error, refetch } = useHostedSession()
  const { removeItem: removeAccessToken } = useLocalStorage('accessToken', '')
  const router = useRouter()

  const [isCloseConfirmationModalOpen, setIsCloseConfirmationModalOpen] =
    useState(false)

  const redirectAfterSession = (url: string) => {
    // adding 2 second delay so users are aware of the redirection and we don't change the page abruptly
    setTimeout(() => {
      router.push(url)
      removeAccessToken()
    }, 2000)
  }

  const onCloseHostedPage = () => {
    addSentryBreadcrumb({
      category: BreadcrumbCategory.SESSION_CANCEL,
      data: session,
    })
    router.push(session?.cancel_url || 'https://awell.health')
  }

  useEffect(() => {
    if (isNil(session?.status) || typeof window === undefined) {
      return
    }

    switch (session?.status) {
      case HostedSessionStatus.Completed:
        addSentryBreadcrumb({
          category: BreadcrumbCategory.SESSION_COMPLETE,
          data: session,
        })
        redirectAfterSession(session.success_url)
        return
      case HostedSessionStatus.Expired:
        addSentryBreadcrumb({
          category: BreadcrumbCategory.SESSION_EXPIRE,
          data: session,
        })
        redirectAfterSession(session.cancel_url)
        return
      default:
        return
    }
  }, [session])

  if (loading) {
    return (
      <>
        <Head>
          <title>{t('seo.loading_title')}</title>
          <meta
            property="og:title"
            content={t('seo.loading_title')}
            key="title"
          />
        </Head>
      </>
    )
  }

  return (
    <>
      <Head>
        <title>{defaultTo(branding?.hosted_page_title, t('seo.title'))}</title>
        <meta property="og:title" content={t('seo.title')} key="title" />
        <meta name="description" content={t('seo.description')} />
      </Head>
      <ThemeProvider accentColor={branding?.accent_color || AWELL_BRAND_COLOR}>
        <HostedPageLayout
          logo={defaultTo(branding?.logo_url, awell_logo)}
          onCloseHostedPage={() => setIsCloseConfirmationModalOpen(true)}
        >
          {session && session?.status !== HostedSessionStatus.Active && (
            <LoadingPage title={t('session.redirecting_to_next_page')} />
          )}
          {error && (
            <ErrorPage title={t('session.loading_error')} onRetry={refetch} />
          )}
          {session && <ActivityContainer pathwayId={session.pathway_id} />}
          <ToastContainer
            position="bottom-right"
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            autoClose={12000}
            hideProgressBar
            draggable
          />
          <Modal
            isOpen={isCloseConfirmationModalOpen}
            title={t('session.close_modal.title')}
            description={t('session.close_modal.description')}
            onCloseModal={() => setIsCloseConfirmationModalOpen(false)}
            icon="warning"
            buttons={[
              <Button
                key="cancel-button"
                variant="primary"
                onClick={() => setIsCloseConfirmationModalOpen(false)}
              >
                {t('session.close_modal.cancel_button_label')}
              </Button>,
              <Button
                key="confirm-button"
                variant="tertiary"
                onClick={onCloseHostedPage}
              >
                {t('session.close_modal.confirm_button_label')}
              </Button>,
            ]}
          />
        </HostedPageLayout>
      </ThemeProvider>
    </>
  )
}

export default Home

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
