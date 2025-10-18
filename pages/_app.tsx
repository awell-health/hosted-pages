import '../styles/globals.css'
import '@awell-health/ui-library/dist/index.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'

import type { FC, ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import { ConnectivityProvider } from '../src/contexts/ConnectivityContext'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)

  return getLayout(
    <ConnectivityProvider>
      <Component {...pageProps} />
    </ConnectivityProvider>
  )
}

export default appWithTranslation(MyApp as FC)
