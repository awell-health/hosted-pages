import '../styles/globals.css'
import '@awell_health/ui-library/dist/index.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import { GraphqlWrapper } from '../src/components/GraphqlWrapper'
import { AuthGuard } from '../src/components/AuthGuard'
import { AuthenticationProvider } from '../src/services/authentication'
import { NoSSRComponent } from '../src/components/NoSSR'
import { ErrorBoundary } from '../src/components/ErrorBoundary'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthenticationProvider>
      <AuthGuard>
        <GraphqlWrapper>
          <NoSSRComponent>
            <ErrorBoundary>
              <Component {...pageProps} />
            </ErrorBoundary>
          </NoSSRComponent>
        </GraphqlWrapper>
      </AuthGuard>
    </AuthenticationProvider>
  )
}

export default appWithTranslation(MyApp)
