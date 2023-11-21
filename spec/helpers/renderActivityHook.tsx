import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { SchemaLink } from '@apollo/client/link/schema'
import { addMocksToSchema } from '@graphql-tools/mock'
import { renderHook, RenderHookResult } from '@testing-library/react'
import { schema } from './schema'
import { ActivityProvider } from '../../src/components/Activities/context'

export function renderActivityHook<TProps = {}, TResult = any>(
  hook: (props: TProps) => TResult,
  {
    mocks,
    initialProps,
  }: {
    mocks?: any
    initialProps?: TProps
  } = {}
): RenderHookResult<TResult, TProps> {
  const mockSchema = addMocksToSchema({
    schema,
    resolvers: () => mocks,
  })

  // this is the exact same client as your actual app.
  // But also includes `SchemaLink` for mocking.
  const client = new ApolloClient({
    link: new SchemaLink({ schema: mockSchema }),
    cache: new InMemoryCache(),
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <ApolloProvider client={client}>
      <ActivityProvider>{children}</ActivityProvider>
    </ApolloProvider>
  )

  return renderHook((props: TProps) => hook(props), {
    wrapper,
    initialProps,
  })
}
