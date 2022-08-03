import { ApolloClient, InMemoryCache } from '@apollo/client'

const client = new ApolloClient({
  uri: 'https://api.sandbox.awellhealth.com/orchestration/m2m/graphql',
  cache: new InMemoryCache(),
})

export default client
