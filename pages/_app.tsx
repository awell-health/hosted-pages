import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import { GraphqlWrapper } from '../src/components/GraphqlWrapper'
import { AuthGuard } from '../src/components/AuthGuard'
import { AuthenticationProvider } from '../src/services/authentication'
import { NoSSRComponent } from '../src/components/NoSSR'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthenticationProvider>
      <AuthGuard>
        <GraphqlWrapper>
          <NoSSRComponent>
            <Component {...pageProps} />
          </NoSSRComponent>
        </GraphqlWrapper>
      </AuthGuard>
    </AuthenticationProvider>
  )
}

export default appWithTranslation(MyApp)
