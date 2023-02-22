import '../styles/globals.css'
import '@awell_health/ui-library/dist/index.css'
import type { AppProps } from 'next/app'
import { appWithTranslation } from 'next-i18next'
import { GraphqlWrapper } from '../src/components/GraphqlWrapper'
import { AuthGuard } from '../src/components/AuthGuard'
import { AuthenticationProvider } from '../src/services/authentication'
import { NoSSRComponent } from '../src/components/NoSSR'
import { ErrorBoundary } from '../src/components/ErrorBoundary'
import { useRouter } from 'next/router'
import { isNil } from 'lodash'
import { StartHostedActivitySessionFlow } from '../src/components/StartHostedActivitySessionFlow'

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const { stakeholder, pathway } = router.query

  if (!isNil(stakeholder) && !isNil(pathway)) {
    return (
      <StartHostedActivitySessionFlow
        stakeholderId={stakeholder as string}
        pathwayId={pathway as string}
      />
    )
  }

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
