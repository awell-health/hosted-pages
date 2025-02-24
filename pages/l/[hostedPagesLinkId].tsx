import type { GetStaticPaths, NextPage } from 'next'
import { useRouter } from 'next/router'
import { StartHostedActivitySessionFlow } from '../../src/components/StartHostedActivitySessionFlow'
import { StartHostedActivitySessionParams } from '../../types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ThemeProvider } from '@awell-health/ui-library'
import { AWELL_BRAND_COLOR } from '../../src/config'
import { NoSSRComponent } from '../../src/components/NoSSR'

/**
 * Purpose of this page is to support shortened URLs i.e. 'hosted-pages.awellhealth.com/l/<hostedPagesLinkId>'
 */
const HostedPagesLink: NextPage = () => {
  const router = useRouter()

  const { hostedPagesLinkId, track_id, activity_id } =
    router.query as StartHostedActivitySessionParams

  return (
    <NoSSRComponent>
      <ThemeProvider accentColor={AWELL_BRAND_COLOR}>
        <StartHostedActivitySessionFlow
          hostedPagesLinkId={hostedPagesLinkId}
          track_id={track_id}
          activity_id={activity_id}
        />
      </ThemeProvider>
    </NoSSRComponent>
  )
}

export default HostedPagesLink

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
