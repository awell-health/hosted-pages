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
              {/* 
                Styles need to be applied to the ErrorBoundary
                to make sure layout is rendered correctly. 
              */}
              <ErrorBoundary style={{ height: '100%' }}>
                {children}
              </ErrorBoundary>
            </NoSSRComponent>
          </GraphqlWrapper>
        </AuthGuard>
      </AuthenticationProvider>
    </>
  )
}
