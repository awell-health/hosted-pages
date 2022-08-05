import type { NextPage } from 'next'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import { useHostedSession } from '../src/hooks/useHostedSession'
import { Activities, LoadingPage } from '../src/components'
import '@awell_health/ui-library/dist/index.css'
import { Navbar } from '@awell_health/ui-library'
import awell_logo from '../src/assets/logo.svg'

const Home: NextPage = () => {
  const { t } = useTranslation()
  const { loading, session, error } = useHostedSession()
  const router = useRouter()

  if (!router.query.sessionId) {
    return <p>{t('error_invalid_url')}</p>
  }

  return (
    <>
      <Navbar logo={awell_logo} />
      {loading && <LoadingPage title={t('session_loading')} />}
      {error && <p>Session not available: {error}</p>}
      {session && <Activities pathwayId={session.pathway_id} />}
    </>
  )
}

export default Home
