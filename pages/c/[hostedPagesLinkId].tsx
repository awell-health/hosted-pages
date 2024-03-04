import type { GetStaticPaths, NextPage } from 'next'
import { useRouter } from 'next/router'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ThemeProvider } from '@awell-health/ui-library'
import { AWELL_BRAND_COLOR } from '../../src/config'
import { NoSSRComponent } from '../../src/components/NoSSR'
import { StartHostedCareflowSessionParams } from '../api/startHostedPathwaySessionFromLink/[hostedPagesLinkId]'
import { StartHostedCareflowSessionFlow } from '../../src/components/StartHostedPathwaySessionFlow'

/**
 * Purpose of this page is to support shortened URLs i.e. 'goto.awell.health/c/<hostedCareflowLinkId>?identifier=system|id'
 */
const HostedCareflowLink: NextPage = () => {
  const router = useRouter()

  const { hostedPagesLinkId, identifier } =
    router.query as StartHostedCareflowSessionParams

  return (
    <NoSSRComponent>
      <ThemeProvider accentColor={AWELL_BRAND_COLOR}>
        <StartHostedCareflowSessionFlow
          hostedPagesLinkId={hostedPagesLinkId}
          identifier={identifier}
        />
      </ThemeProvider>
    </NoSSRComponent>
  )
}

export default HostedCareflowLink

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}

export const getStaticPaths: GetStaticPaths<{ slug: string }> = async () => {
  return {
    paths: [], //indicates that no page needs be created at build time
    fallback: 'blocking', //indicates the type of fallback
  }
}
