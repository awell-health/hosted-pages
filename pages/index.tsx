import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import nextI18NextConfig from '../next-i18next.config.js'
import type { NextPage } from 'next'
import Head from 'next/head'
import styles from '../styles/Home.module.css'
import { useTranslation } from 'next-i18next'
import { useRouter } from 'next/router'
import useSwr from 'swr'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

const Home: NextPage = () => {
  const router = useRouter()
  const { data, error } = useSwr(
    router.query.sessionId ? `/api/session/${router.query.sessionId}` : null,
    fetcher
  )
  const { t } = useTranslation()
  return (
    <div className={styles.container}>
      <Head>
        <title>Awell hosted pages</title>
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>{t('start_pathway_session_title')}</h1>
        {router.query.sessionId ? (
          <>
            <pre
              style={{
                maxWidth: 500,
                whiteSpace: 'break-spaces',
                wordWrap: 'break-word',
              }}
            >
              Session: {JSON.stringify(data)}
            </pre>
            <pre>Error: {JSON.stringify(error)}</pre>
          </>
        ) : (
          <a href="?id=12345">Start</a>
        )}
      </main>
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
