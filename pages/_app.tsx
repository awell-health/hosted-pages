import '../styles/globals.css'
import '@awell-health/ui-library/dist/index.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'

import type { FC, ReactElement, ReactNode } from 'react'
import type { NextPage } from 'next'
import { init } from '@module-federation/runtime'

export type NextPageWithLayout<P = {}, IP = P> = NextPage<P, IP> & {
  getLayout?: (page: ReactElement) => ReactNode
}

type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout
}

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page)
  init({
    name: 'hosted-pages',
    remotes: [
      {
        name: '@extension',
        entry: `${process.env.NEXT_PUBLIC_URL_EXTENSIONS}/frontend/remoteEntry.js`,
        type: 'esm',
      },
    ],
  })

  return getLayout(<Component {...pageProps} />)
}

export default appWithTranslation(MyApp as FC)
