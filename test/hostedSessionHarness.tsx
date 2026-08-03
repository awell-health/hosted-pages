/**
 * Test harness for the hosted-session state machine.
 *
 * It deliberately uses the *real* `createClient` link chain (authentication →
 * request lifecycle → retry → error → http) rather than `MockedProvider`,
 * because the bug this harness exists to pin down lives in the interaction
 * between `cancelPendingRequests()`, `AbortController`, and Apollo's polling
 * observable. `MockedProvider` replaces exactly the layer under test.
 *
 * Two things are controllable:
 *  - `fetchController` — every GraphQL HTTP request stays in flight until the
 *    test resolves it, so "a poll is in flight right now" is deterministic.
 *  - `subscriptionController` — pushes `sessionCompleted` / `sessionExpired`
 *    frames on demand, standing in for the websocket.
 */
import {
  ApolloLink,
  ApolloProvider,
  type FetchResult,
  Observable,
  type Operation,
} from '@apollo/client'
import { getMainDefinition } from '@apollo/client/utilities'
import { render } from '@testing-library/react'
import React, { type ReactNode } from 'react'
import { vi } from 'vitest'
import {
  HostedSessionProvider,
  useHostedSession,
} from '../src/hooks/useHostedSession'
import type { UseHostedSessionHook } from '../src/hooks/useHostedSession/useHostedSession'
import {
  createClient,
  createGraphQLRequestLifecycle,
  type GraphQLRequestLifecycle,
  GraphQLRequestLifecycleContext,
} from '../src/services/graphql'
import fragmentTypes from '../src/types/generated/fragment-types'
import {
  GetHostedSessionDocument,
  HostedSessionStakeholderType,
  HostedSessionStatus,
} from '../src/types/generated/types-orchestration'

const HTTP_URI = 'https://api.test.awell.health/graphql'
const WS_URI = 'wss://api.test.awell.health/graphql'

export const SESSION_ID = 'GpQ2OeoFxwm9'
export const SUCCESS_URL = 'https://developers.awellhealth.com/'
export const CANCEL_URL = 'https://awell.health/cancelled'

export const buildSession = (status: HostedSessionStatus) => ({
  __typename: 'HostedSession' as const,
  id: SESSION_ID,
  pathway_id: 'qVx9NKTmQonN',
  status,
  success_url: SUCCESS_URL,
  cancel_url: CANCEL_URL,
  organization_slug: 'awell-dev',
  stakeholder: {
    __typename: 'HostedSessionStakeholder' as const,
    id: 'stakeholder-1',
    type: HostedSessionStakeholderType.Patient,
    name: 'Test Patient',
  },
})

export const buildHostedSessionQueryData = (status: HostedSessionStatus) => ({
  __typename: 'Query' as const,
  hostedSession: {
    __typename: 'HostedSessionPayload' as const,
    session: buildSession(status),
    branding: {
      __typename: 'BrandingSettings' as const,
      logo_url: null,
      hosted_page_title: 'Awell',
      accent_color: '#004ac2',
      hosted_page_auto_progress: null,
      hosted_page_autosave: null,
      custom_theme: null,
    },
    metadata: {
      __typename: 'SessionMetadata' as const,
      pathway_definition_id: 'definition-1',
      tenant_id: 'tenant-1',
    },
  },
})

interface CapturedRequest {
  operationName: string
  /** Resolve the request with a GraphQL payload, as the server would. */
  resolve: (_data: unknown) => void
  /** Fail the request the way a dropped connection would. */
  fail: (_error: Error) => void
  isSettled: () => boolean
  isAborted: () => boolean
}

const jsonResponse = (payload: unknown) => ({
  status: 200,
  ok: true,
  headers: {
    get: (name: string) =>
      name.toLowerCase() === 'content-type' ? 'application/json' : null,
  },
  text: () => Promise.resolve(JSON.stringify(payload)),
})

export interface FetchController {
  requests: Array<CapturedRequest>
  requestsFor: (_operationName: string) => Array<CapturedRequest>
  pendingFor: (_operationName: string) => Array<CapturedRequest>
}

/**
 * Replaces `globalThis.fetch` with a queue the test drives by hand. Requests
 * honour their `AbortSignal` exactly as a real fetch does: they reject with a
 * DOMException named `AbortError`.
 */
export const installFetchController = (): FetchController => {
  const requests: Array<CapturedRequest> = []

  const controller: FetchController = {
    requests,
    requestsFor: (operationName) =>
      requests.filter((request) => request.operationName === operationName),
    pendingFor: (operationName) =>
      requests.filter(
        (request) =>
          request.operationName === operationName && !request.isSettled()
      ),
  }

  vi.stubGlobal(
    'fetch',
    vi.fn((_url: string, options: RequestInit = {}) => {
      const body = JSON.parse(String(options.body ?? '{}'))
      let settled = false
      let aborted = false

      const request: CapturedRequest = {
        operationName: body.operationName ?? 'unknown',
        resolve: () => undefined,
        fail: () => undefined,
        isSettled: () => settled,
        isAborted: () => aborted,
      }

      const promise = new Promise((resolve, reject) => {
        request.resolve = (data) => {
          if (settled) return
          settled = true
          resolve(jsonResponse(data))
        }
        request.fail = (error) => {
          if (settled) return
          settled = true
          reject(error)
        }

        const signal = options.signal
        if (signal) {
          const onAbort = () => {
            aborted = true
            if (settled) return
            settled = true
            reject(new DOMException('The operation was aborted.', 'AbortError'))
          }
          if (signal.aborted) {
            onAbort()
          } else {
            signal.addEventListener('abort', onAbort, { once: true })
          }
        }
      })

      requests.push(request)
      return promise
    })
  )

  return controller
}

export interface SubscriptionController {
  link: ApolloLink
  /** Number of live subscribers for an operation. */
  subscriberCount: (_operationName: string) => number
  /** Push a frame to every live subscriber of an operation. */
  emit: (_operationName: string, _data: unknown) => void
}

const isSubscriptionOperation = (operation: Operation): boolean => {
  const definition = getMainDefinition(operation.query)
  return (
    definition.kind === 'OperationDefinition' &&
    definition.operation === 'subscription'
  )
}

export const createSubscriptionController = (): SubscriptionController => {
  const subscribers = new Map<
    string,
    Set<{ next: (_value: FetchResult) => void }>
  >()

  const link = new ApolloLink((operation, forward) => {
    if (!isSubscriptionOperation(operation)) {
      return forward(operation)
    }

    return new Observable<FetchResult>((observer) => {
      const forOperation =
        subscribers.get(operation.operationName) ??
        new Set<{ next: (_value: FetchResult) => void }>()
      forOperation.add(observer)
      subscribers.set(operation.operationName, forOperation)

      return () => {
        forOperation.delete(observer)
      }
    })
  })

  return {
    link,
    subscriberCount: (operationName) =>
      subscribers.get(operationName)?.size ?? 0,
    emit: (operationName, data) => {
      const forOperation = subscribers.get(operationName)
      if (!forOperation || forOperation.size === 0) {
        throw new Error(`No live subscribers for ${operationName}`)
      }
      forOperation.forEach((observer) => observer.next({ data } as FetchResult))
    },
  }
}

export interface HostedSessionHarness {
  fetchController: FetchController
  subscriptionController: SubscriptionController
  requestLifecycle: GraphQLRequestLifecycle
  /** Latest value returned by `useHostedSession()`. */
  current: () => UseHostedSessionHook
  renderCount: () => number
  unmount: () => void
  /** Session status as normalised in the Apollo cache. */
  readCachedStatus: () => string | undefined
  readCacheEntity: () => unknown
  networkStatus: () => number | undefined
}

export const renderHostedSession = (): HostedSessionHarness => {
  const fetchController = installFetchController()
  const subscriptionController = createSubscriptionController()
  const requestLifecycle = createGraphQLRequestLifecycle()

  const client = createClient({
    httpUri: HTTP_URI,
    wsUri: WS_URI,
    extraLinks: [subscriptionController.link],
    cacheConfig: { possibleTypes: fragmentTypes.possibleTypes },
    requestLifecycle,
  })

  let latest: UseHostedSessionHook | undefined
  let renders = 0

  const Probe = () => {
    latest = useHostedSession()
    renders += 1
    return null
  }

  const Wrapper = ({ children }: { children?: ReactNode }) => (
    <GraphQLRequestLifecycleContext.Provider value={requestLifecycle}>
      <ApolloProvider client={client}>
        <HostedSessionProvider>{children}</HostedSessionProvider>
      </ApolloProvider>
    </GraphQLRequestLifecycleContext.Provider>
  )

  const { unmount } = render(
    <Wrapper>
      <Probe />
    </Wrapper>
  )

  return {
    fetchController,
    subscriptionController,
    requestLifecycle,
    current: () => {
      if (!latest) {
        throw new Error('useHostedSession has not rendered yet')
      }
      return latest
    },
    renderCount: () => renders,
    unmount,
    readCachedStatus: () => {
      const cached = client.readQuery<{
        hostedSession: { session: { status: string } }
      }>({ query: GetHostedSessionDocument })
      return cached?.hostedSession?.session?.status
    },
    readCacheEntity: () =>
      (client.cache.extract() as Record<string, unknown>)[
        `HostedSession:${SESSION_ID}`
      ],
    networkStatus: () => {
      const queries = Array.from(
        (
          client as unknown as {
            queryManager: {
              getObservableQueries: (
                _include: string
              ) => Map<string, { getCurrentResult: () => unknown }>
            }
          }
        ).queryManager
          .getObservableQueries('all')
          .values()
      )
      const currentResult = queries[0]?.getCurrentResult() as
        | { networkStatus?: number }
        | undefined
      return currentResult?.networkStatus
    },
  }
}
