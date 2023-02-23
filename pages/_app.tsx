import '../styles/globals.css'
import '@awell_health/ui-library/dist/index.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'

import type { FC, ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { StartHostedActivitySessionFlow } from '../src/components/StartHostedActivitySessionFlow'
import { HostedLinkParams } from '../types'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const router = useRouter()

  // if it is a stakeholder session flow
  const { stakeholderId, pathwayId, tenantId } =
    router.query as HostedLinkParams
  if ([stakeholderId, pathwayId, tenantId].every(Boolean)) {
    return (
      <StartHostedActivitySessionFlow
        stakeholderId={stakeholderId}
        pathwayId={pathwayId}
        tenantId={tenantId}
      />
    )
  }

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return getLayout(<Component {...pageProps} />)
}

export default appWithTranslation(MyApp as FC)
