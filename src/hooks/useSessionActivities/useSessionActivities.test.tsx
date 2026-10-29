/**
 * Tests for forwarding the preferred language to `hostedSessionActivities`.
 *
 * The integrator sets the language via the i18n locale prefix in the hosted
 * pages URL (e.g. `/pl?sessionId=…`), which Next.js exposes as `router.locale`.
 * We forward it to the activities query as `language` so the server returns
 * localized form content — but only when a locale is actually present in the
 * URL (i.e. it differs from the default), so an unprefixed URL leaves the
 * server to apply its own default instead of being pinned to `language: 'en'`.
 *
 * Each case provides exactly one MockedProvider mock keyed on the variables we
 * expect. MockedProvider matches by deep-equal variables, so a successful load
 * (no error) proves the hook sent precisely those variables.
 */
import { MockedProvider, type MockedResponse } from '@apollo/client/testing'
import { renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  GetHostedSessionActivitiesDocument,
  HostedSessionStatus,
} from '../../types/generated/types-orchestration'
import { useSessionActivities } from './useSessionActivities'

const mockUseRouter = vi.fn()
vi.mock('next/router', () => ({
  useRouter: () => mockUseRouter(),
}))

const mockUseHostedSession = vi.fn()
vi.mock('../useHostedSession', () => ({
  useHostedSession: () => mockUseHostedSession(),
}))

const activitiesResult = {
  hostedSessionActivities: {
    __typename: 'HostedSessionActivitiesPayload' as const,
    success: true,
    activities: [],
  },
}

const mockFor = (variables: Record<string, unknown>): MockedResponse => ({
  request: { query: GetHostedSessionActivitiesDocument, variables },
  result: { data: activitiesResult },
})

const renderWithMocks = (mocks: Array<MockedResponse>) => {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MockedProvider mocks={mocks} addTypename>
      {children}
    </MockedProvider>
  )
  return renderHook(() => useSessionActivities(), { wrapper })
}

describe('useSessionActivities language forwarding', () => {
  beforeEach(() => {
    mockUseHostedSession.mockReturnValue({
      session: { status: HostedSessionStatus.Active },
    })
  })

  it('forwards the URL locale as `language` when it differs from the default', async () => {
    mockUseRouter.mockReturnValue({
      locale: 'pl',
      defaultLocale: 'en',
      query: {},
    })

    const { result } = renderWithMocks([
      mockFor({ only_stakeholder_activities: true, language: 'pl' }),
    ])

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeUndefined()
    expect(result.current.activities).toEqual([])
  })

  it('omits `language` when the locale equals the default locale', async () => {
    mockUseRouter.mockReturnValue({
      locale: 'en',
      defaultLocale: 'en',
      query: {},
    })

    const { result } = renderWithMocks([
      mockFor({ only_stakeholder_activities: true }),
    ])

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeUndefined()
    expect(result.current.activities).toEqual([])
  })

  it('omits `language` when no locale is present', async () => {
    mockUseRouter.mockReturnValue({
      locale: undefined,
      defaultLocale: 'en',
      query: {},
    })

    const { result } = renderWithMocks([
      mockFor({ only_stakeholder_activities: true }),
    ])

    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBeUndefined()
    expect(result.current.activities).toEqual([])
  })
})
