import type { NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { useTranslation } from 'next-i18next'
import {
  ThemeProvider,
  HostedPageLayout,
  Message as MessageViewer,
} from '@awell_health/ui-library'
import 'react-toastify/dist/ReactToastify.css'
import awell_logo from '../src/assets/logo.svg'
import Head from 'next/head'
import classes from '../styles/Preview.module.css'
import { ErrorBoundary } from '../src/components/ErrorBoundary'
import { NoSSRComponent } from '../src/components/NoSSR'

const AWELL_BRAND_COLOR = '#004ac2'

const Preview: NextPage = () => {
  const { t } = useTranslation()

  const onStartDemo = () => {
    window.location.href =
      'https://orchestration-stories.vercel.app/api/examples/preview-hosted-pages'
  }

  return (
    <>
      <Head>
        <title>Awell Hosted Pages Demo</title>
        <meta
          property="og:title"
          content="Awell Hosted Pages Demo"
          key="title"
        />
        <meta
          name="description"
          content="Learn how Awell Hosted Pages work for your stakeholders."
        />
      </Head>
      <NoSSRComponent>
        {/* 
          Styles need to be applied to the ErrorBoundary
          to make sure layout is rendered correctly. 
        */}
        <ErrorBoundary style={{ height: '100%' }}>
          <ThemeProvider accentColor={AWELL_BRAND_COLOR}>
            <HostedPageLayout
              logo={awell_logo}
              onCloseHostedPage={() => window.close()}
            >
              <MessageViewer
                content={`
              <p>
                This is a <strong>simulation</strong> of the Awell Hosted Pages app. The <a href='https://developers.awellhealth.com/awell-orchestration/docs/activities/awell-hosted-pages/what-are-awell-hosted-pages' title='What are Awell Hosted Pages'>Awell Hosted Pages app</a> 
                is a prebuilt app where stakeholders (patient and clinical stakeholders) can 
                interact with activities in care flows. Your stakeholders will be redirected 
                to this app at run-time by clicking on the embedded link to complete their 
                pending activities in the care flow.
              </p>
              <p>
                In order to give you a sense of how it would work, click the button below. 
                This will create an Awell Hosted Pages session where you can interact with <strong>some 
                placeholder activities</strong> – not reflecting your care flow design.
              </p>
              <p>
                Want to learn more about what it means to embed an Awell Hosted Pages link in your actions? 
                – read <a href='http://help.awellhealth.com/en/articles/7021469-embed-an-awell-hosted-pages-link' title='Help article Awell Hosted Pages'>this Help article</a>.
              </p>
                `}
                subject="Awell Hosted Pages Demo"
                attachments={[]}
                attachmentIcon={<div />}
                attachmentLabels={{
                  video: '',
                  link: '',
                  file: '',
                }}
                onMessageRead={onStartDemo}
                buttonLabels={{
                  readMessage: t('preview.cta'),
                }}
              />
            </HostedPageLayout>
          </ThemeProvider>
        </ErrorBoundary>
      </NoSSRComponent>
    </>
  )
}

export default Preview

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
