import { FC } from 'react'
import { GraphqlWrapper } from '../components/GraphqlWrapper'
import { AuthGuard } from '../components/AuthGuard'
import { AuthenticationProvider } from '../services/authentication'
import { NoSSRComponent } from '../components/NoSSR'
import { ErrorBoundary } from '../components/ErrorBoundary'
import { NetworkErrorProvider } from '../contexts/NetworkErrorContext'
import { ConnectivityProvider } from '../contexts/ConnectivityContext'
import { HostedSessionProvider } from '../hooks/useHostedSession'

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
                    Keep session initialization inside the ErrorBoundary so
                    malformed session or branding data renders the safe error
                    page instead of crashing the application.
                  */}
                  <ErrorBoundary>
                    <HostedSessionProvider>{children}</HostedSessionProvider>
                  </ErrorBoundary>
                </NoSSRComponent>
              </GraphqlWrapper>
            </ConnectivityProvider>
          </NetworkErrorProvider>
        </AuthGuard>
      </AuthenticationProvider>
    </>
  )
}
