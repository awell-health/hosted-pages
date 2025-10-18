import { FC } from 'react'
import { GraphqlWrapper } from '../components/GraphqlWrapper'
import { AuthGuard } from '../components/AuthGuard'
import { AuthenticationProvider } from '../services/authentication'
import { NoSSRComponent } from '../components/NoSSR'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { NetworkErrorProvider } from '../contexts/NetworkErrorContext'
import { ConnectivityProvider } from '../contexts/ConnectivityContext'

interface LayoutProps {
  children: React.ReactNode
}

export const HostedSessionLayout: FC<LayoutProps> = ({ children }) => {
  return (
    <>
      {/* Manages JWT tokens */}
      <AuthenticationProvider>
        {/* Authorization layer to handle auth errors */}
        <AuthGuard>
          {/* Network error state management */}
          <NetworkErrorProvider>
            {/* Connectivity-aware polling control */}
            <ConnectivityProvider>
              {/* GraphQL client */}
              <GraphqlWrapper>
                <NoSSRComponent>
                  {/*
                    Styles need to be applied to the ErrorBoundary
                    to make sure layout is rendered correctly.
                  */}
                  <ErrorBoundary>{children}</ErrorBoundary>
                </NoSSRComponent>
              </GraphqlWrapper>
            </ConnectivityProvider>
          </NetworkErrorProvider>
        </AuthGuard>
      </AuthenticationProvider>
    </>
  )
}
