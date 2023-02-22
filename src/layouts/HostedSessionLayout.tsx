import { FC } from 'react'
import { GraphqlWrapper } from '../components/GraphqlWrapper'
import { AuthGuard } from '../components/AuthGuard'
import { AuthenticationProvider } from '../services/authentication'
import { NoSSRComponent } from '../components/NoSSR'
import { ErrorBoundary } from '../components/ErrorBoundary'

interface LayoutProps {
  children: React.ReactNode
}

export const HostedSessionLayout: FC<LayoutProps> = ({ children }) => {
  return (
    <>
      <AuthenticationProvider>
        <AuthGuard>
          <GraphqlWrapper>
            <NoSSRComponent>
              <ErrorBoundary>{children}</ErrorBoundary>
            </NoSSRComponent>
          </GraphqlWrapper>
        </AuthGuard>
      </AuthenticationProvider>
    </>
  )
}
