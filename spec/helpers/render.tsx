import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { SchemaLink } from '@apollo/client/link/schema'
import { addMocksToSchema } from '@graphql-tools/mock'
import { render as rtlRender } from '@testing-library/react'
import { schema } from './schema'

export function render(component: any, { mocks }: { mocks?: any } = {}) {
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

  return rtlRender(<ApolloProvider client={client}>{component}</ApolloProvider>)
}
