/* eslint-disable react-hooks/exhaustive-deps */
import type { NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useHostedSession } from '../src/hooks/useHostedSession'
import { ActivityContainer, LoadingPage, ErrorPage } from '../src/components'
import '@awell_health/ui-library/dist/index.css'
import { Navbar, ThemeProvider } from '@awell_health/ui-library'
import awell_logo from '../src/assets/logo.svg'
import { useEffect } from 'react'
import { HostedSessionStatus } from '../src/types/generated/types-orchestration'
import { defaultTo, isNil } from 'lodash'
import { useLocalStorage } from '../src/hooks/useLocalStorage'
import Head from 'next/head'

const Home: NextPage = () => {
  const { t } = useTranslation()
  const { loading, session, branding, error } = useHostedSession()
  const { removeItem: removeAccessToken } = useLocalStorage('accessToken', '')
  const router = useRouter()

  const redirectAfterSession = (url: string) => {
    // adding 2 second delay so users are aware of the redirection and we don't change the page abruptly
    setTimeout(() => {
      router.push(url)
      removeAccessToken()
    }, 2000)
  }

  useEffect(() => {
    if (isNil(session?.status) || typeof window === undefined) {
      return
    }

    switch (session?.status) {
      case HostedSessionStatus.Completed:
        redirectAfterSession(session.success_url)
        return
      case HostedSessionStatus.Expired:
        redirectAfterSession(session.cancel_url)
        return
      default:
        return
    }
  }, [session])

  if (session?.status !== HostedSessionStatus.Active) {
    return (
      <ThemeProvider accentColor={branding?.accent_color || undefined}>
        <LoadingPage title={t('redirecting_to_next_page')} />
      </ThemeProvider>
    )
  }

  return (
    <>
      <Head>
        <title>
          {defaultTo(branding?.hosted_page_title, t('awell_activities'))}
        </title>
        <meta property="og:title" content={t('awell_activities')} key="title" />
        <meta name="description" content={t('awell_page_description')} />
      </Head>
      <ThemeProvider accentColor={branding?.accent_color || undefined}>
        <Navbar logo={defaultTo(branding?.logo_url, awell_logo)} />
        {loading && <LoadingPage hideLoader title={t('session_loading')} />}
        {error && <ErrorPage title={t('session_loading_error')} />}
        {session && <ActivityContainer pathwayId={session.pathway_id} />}
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
