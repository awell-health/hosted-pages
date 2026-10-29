/**
 * The network error gate trips when orchestration cannot be reached. Whether
 * that is the patient's connection or our service depends on whether the
 * browser itself is online: telling an online patient to check their internet
 * during one of our outages blames them for something they cannot fix.
 */
import { act, render, screen } from '@testing-library/react'
import React from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConnectivityProvider } from '../../contexts/ConnectivityContext'
import { NetworkErrorPage } from './NetworkErrorPage'

vi.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@sentry/nextjs', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// The ui-library bundle reads CSS.supports at import time, which jsdom lacks.
vi.mock('@awell-health/ui-library', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}))

const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    value: online,
    configurable: true,
  })
}

const emitConnectivity = (online: boolean) => {
  setOnline(online)
  act(() => {
    window.dispatchEvent(new Event(online ? 'online' : 'offline'))
  })
}

const renderPage = () =>
  render(
    <ConnectivityProvider>
      <NetworkErrorPage onRetry={async () => undefined} sessionId="session-1" />
    </ConnectivityProvider>
  )

beforeEach(() => {
  setOnline(true)
})

afterEach(() => {
  setOnline(true)
})

describe('NetworkErrorPage', () => {
  it('says the service is unavailable when the browser is online', () => {
    renderPage()

    expect(screen.getByText('session.service_unavailable_title')).toBeTruthy()
    expect(
      screen.getByText('session.service_unavailable_description')
    ).toBeTruthy()
    expect(screen.queryByText('session.network_error_description')).toBeNull()
  })

  it('asks the patient to check their connection when the browser is offline', () => {
    setOnline(false)
    renderPage()

    expect(screen.getByText('session.network_error_title')).toBeTruthy()
    expect(screen.getByText('session.network_error_description')).toBeTruthy()
    expect(screen.queryByText('session.service_unavailable_title')).toBeNull()
  })

  it('switches copy when connectivity changes while the page is shown', () => {
    setOnline(false)
    renderPage()
    expect(screen.getByText('session.network_error_title')).toBeTruthy()

    emitConnectivity(true)

    expect(screen.getByText('session.service_unavailable_title')).toBeTruthy()
    expect(screen.queryByText('session.network_error_title')).toBeNull()
  })
})
