import { isNil } from 'lodash'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { StartHostedActivitySessionFlow } from '../../src/components/StartHostedActivitySessionFlow'
import { StartHostedActivitySessionParams } from '../../types'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ThemeProvider } from '@awell_health/ui-library'
import { AWELL_BRAND_COLOR } from '../../src/config'

/**
 * Purpose of this page is to support shortened URLs i.e. 'hosted-pages.awellhealth.com/l/<hostedPagesLinkId>'
 */
const HostedPagesLink: NextPage = () => {
  const router = useRouter()

  // if it is a stakeholder session flow (redirected after validation)
  const { hostedPagesLinkId } = router.query as StartHostedActivitySessionParams

  // if it is a shortened URL
  if (!isNil(hostedPagesLinkId) && typeof hostedPagesLinkId === 'string') {
    return (
      <ThemeProvider accentColor={AWELL_BRAND_COLOR}>
        <StartHostedActivitySessionFlow hostedPagesLinkId={hostedPagesLinkId} />
      </ThemeProvider>
    )
  }

  return <></>
}

export default HostedPagesLink

export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common'])),
    },
  }
}
