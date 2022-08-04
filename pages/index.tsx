import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../next-i18next.config.js'
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import useSwr from 'swr'
import { useHostedSession } from '../src/hooks/useHostedSession'
import { Activities } from '../src/components/Activities'
import '@awell_health/ui-library/dist/index.css'

const Home: NextPage = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const { loading, session } = useHostedSession()

  if (!router.query.sessionId) {
    return <p>{t('error_invalid_url')}</p>
  }

  if (loading) {
    // TODO add proper spinner or sth
    return <p>LOADING....</p>
  }

  if (!session) {
    return <p>{t('error_invalid_session_id')}</p>
  }

  return (
    <div className={styles.container}>
      <Activities pathwayId={session.pathway_id} />
    </div>
  )
}

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'], nextI18NextConfig)),
      // Will be passed to the page component as props
    },
  }
}

export default Home
