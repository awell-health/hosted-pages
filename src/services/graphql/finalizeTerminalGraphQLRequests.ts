import type {
  GraphQLRequestLifecycle,
  GraphQLSettlingResult,
} from './apollo-client'

export const finalizeTerminalGraphQLRequests = async ({
  requestLifecycle,
  clearAccessToken,
  isCurrent = () => true,
}: {
  requestLifecycle: GraphQLRequestLifecycle
  clearAccessToken: () => void
  isCurrent?: () => boolean
}): Promise<GraphQLSettlingResult> => {
  const result = await requestLifecycle.waitForSettlingRequests()

  if (result.status === 'timed-out') {
    requestLifecycle.cancelPendingRequests({ abortSettling: true })
  }

  // A finalization started by an unmounted or superseded session must not
  // clear credentials installed for the next session.
  if (isCurrent()) {
    clearAccessToken()
  }

  return result
}
