import type { NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useHostedSession } from '../src/hooks/useHostedSession'
import { Activities, LoadingPage, ErrorPage } from '../src/components'
import '@awell_health/ui-library/dist/index.css'
import { Navbar } from '@awell_health/ui-library'
import awell_logo from '../src/assets/logo.svg'
import { useEffect } from 'react'
import { HostedSessionStatus } from '../src/types/generated/types-orchestration'
import { isNil } from 'lodash'

const Home: NextPage = () => {
  const { t } = useTranslation()
  const { loading, session, error } = useHostedSession()
  const router = useRouter()

  useEffect(() => {
    if (isNil(session?.status) || typeof window === undefined) {
      return
    }
    switch (session?.status) {
      case HostedSessionStatus.Completed:
        window.location.href = session.success_url
      case HostedSessionStatus.Expired:
        window.location.href = session.cancel_url
      default:
    }
  }, [session])

  if (!router.query.sessionId) {
    return <ErrorPage title={t('error_invalid_url')} />
  }

  return (
    <>
      <Navbar logo={awell_logo} />
      {loading && <LoadingPage title={t('session_loading')} />}
      {error && <ErrorPage title={error} />}
      {session && <Activities pathwayId={session.pathway_id} />}
    </>
  )
}

export default Home
