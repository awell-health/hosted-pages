import type { NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useHostedSession } from '../src/hooks/useHostedSession'
import { ActivityContainer, LoadingPage, ErrorPage } from '../src/components'
import '@awell_health/ui-library/dist/index.css'
import { Navbar } from '@awell_health/ui-library'
import awell_logo from '../src/assets/logo.svg'
import { useEffect } from 'react'
import { HostedSessionStatus } from '../src/types/generated/types-orchestration'
import { isNil } from 'lodash'
import { useLocalStorage } from '../src/hooks/useLocalStorage'
import Head from 'next/head'

const Home: NextPage = () => {
  const { t } = useTranslation()
  const { loading, session, error } = useHostedSession()
  const { removeItem: removeAccessToken } = useLocalStorage('accessToken', '')
  const router = useRouter()

  useEffect(() => {
    if (isNil(session?.status) || typeof window === undefined) {
      return
    }
    switch (session?.status) {
      case HostedSessionStatus.Completed:
        removeAccessToken()
        router.push(session.success_url)
        return
      case HostedSessionStatus.Expired:
        removeAccessToken()
        router.push(session.cancel_url)
        return
      default:
        return
    }
  }, [session])

  if (router.isReady && !router.query.sessionId) {
    return <ErrorPage title={t('error_invalid_url')} />
  }

  return (
    <>
      <Navbar logo={awell_logo} />
      {loading && <LoadingPage title={t('session_loading')} />}
      {error && <ErrorPage title={t('session_loading_error')} />}
      {session && <ActivityContainer pathwayId={session.pathway_id} />}
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
