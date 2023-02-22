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

  const onStartPreview = () => {
    window.location.href =
      'https://orchestration-stories.vercel.app/api/examples/preview-hosted-pages'
  }

  return (
    <>
      <Head>
        <title>Awell Hosted Pages Preview</title>
        <meta
          property="og:title"
          content="Awell Hosted Pages Preview"
          key="title"
        />
        <meta
          name="description"
          content="Learn how Awell Hosted Pages work for your stakeholders."
        />
      </Head>
      <NoSSRComponent>
        <ErrorBoundary>
          <ThemeProvider accentColor={AWELL_BRAND_COLOR}>
            <HostedPageLayout
              logo={awell_logo}
              onCloseHostedPage={() => window.close()}
            >
              <MessageViewer
                format="HTML"
                content={`
              <p>
                This is a preview of Awell Hosted Pages. Your
                stakeholders will be redirected here to complete the pending
                activities in their care flow.
              </p>
              <p>
                A link for an Awell Hosted Pages session can only be generated
                at run-time when care flows are orchestrated. In order to give
                you a sense of how it works, click the button below. This will
                create an Awell Hosted Pages session where you can interact
                with some dummy activities.
              </p>
                `}
                subject="Awell Hosted Pages Preview"
                attachments={[]}
                attachmentIcon={<div />}
                attachmentLabels={{
                  video: '',
                  link: '',
                  file: '',
                }}
                onMessageRead={onStartPreview}
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
