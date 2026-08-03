/**
 * Contract tests for connectivity-driven polling.
 *
 * The rule being pinned down: visibility selects the *interval*, connectivity
 * decides whether polling happens at all. A hidden tab is not an abandoned
 * session — the session can still complete or expire while the patient is
 * elsewhere — but an offline browser cannot complete a request either way.
 */
import { act, render } from '@testing-library/react'
import React, { useEffect } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { PollingMode } from '../config/polling'
import { ConnectivityProvider, useConnectivity } from './ConnectivityContext'

const setVisibility = (state: 'visible' | 'hidden') => {
  Object.defineProperty(document, 'visibilityState', {
    value: state,
    configurable: true,
  })
}

const setOnline = (online: boolean) => {
  Object.defineProperty(navigator, 'onLine', {
    value: online,
    configurable: true,
  })
}

const emitVisibilityChange = (state: 'visible' | 'hidden') => {
  setVisibility(state)
  act(() => {
    document.dispatchEvent(new Event('visibilitychange'))
  })
}

const emitConnectivity = (online: boolean) => {
  setOnline(online)
  act(() => {
    window.dispatchEvent(new Event(online ? 'online' : 'offline'))
  })
}

interface Harness {
  startedModes: () => Array<PollingMode>
  stopCount: () => number
}

/** Registers a polling task the same way pages/index.tsx does. */
const renderConnectivity = (): Harness => {
  const start = vi.fn<[PollingMode], void>()
  const stop = vi.fn()

  const Consumer = () => {
    const { registerPollingTask } = useConnectivity()
    useEffect(() => registerPollingTask({ start, stop }), [registerPollingTask])
    return null
  }

  render(
    <ConnectivityProvider>
      <Consumer />
    </ConnectivityProvider>
  )

  return {
    startedModes: () => start.mock.calls.map(([mode]) => mode),
    stopCount: () => stop.mock.calls.length,
  }
}

beforeEach(() => {
  setOnline(true)
  setVisibility('visible')
})

afterEach(() => {
  setOnline(true)
  setVisibility('visible')
})

describe('registerPollingTask', () => {
  it('starts in visible mode when the tab is in front and online', () => {
    const harness = renderConnectivity()

    expect(harness.startedModes()).toEqual(['visible'])
  })

  it('starts in hidden mode when mounted on an already-hidden tab', () => {
    setVisibility('hidden')

    const harness = renderConnectivity()

    expect(harness.startedModes()).toEqual(['hidden'])
  })

  it('does not start while offline', () => {
    setOnline(false)

    const harness = renderConnectivity()

    expect(harness.startedModes()).toEqual([])
  })
})

describe('visibility changes keep polling alive at a different interval', () => {
  it('restarts in hidden mode when the tab is backgrounded', () => {
    const harness = renderConnectivity()
    expect(harness.startedModes()).toEqual(['visible'])

    emitVisibilityChange('hidden')

    // Re-registered rather than left stopped: this is the whole point.
    expect(harness.startedModes()).toEqual(['visible', 'hidden'])
    expect(harness.stopCount()).toBe(1)
  })

  it('restarts in visible mode when the tab comes back to the front', () => {
    const harness = renderConnectivity()

    emitVisibilityChange('hidden')
    emitVisibilityChange('visible')

    expect(harness.startedModes()).toEqual(['visible', 'hidden', 'visible'])
  })

  it('keeps polling hidden across repeated background/foreground cycles', () => {
    const harness = renderConnectivity()

    emitVisibilityChange('hidden')
    emitVisibilityChange('visible')
    emitVisibilityChange('hidden')

    expect(harness.startedModes()).toEqual([
      'visible',
      'hidden',
      'visible',
      'hidden',
    ])
  })
})

describe('connectivity is what stops polling', () => {
  it('stops and does not restart when the browser goes offline', () => {
    const harness = renderConnectivity()
    expect(harness.startedModes()).toEqual(['visible'])

    emitConnectivity(false)

    expect(harness.stopCount()).toBe(1)
    expect(harness.startedModes()).toEqual(['visible'])
  })

  it('resumes when the browser comes back online', () => {
    const harness = renderConnectivity()

    emitConnectivity(false)
    emitConnectivity(true)

    expect(harness.startedModes()).toEqual(['visible', 'visible'])
  })

  it('resumes in hidden mode when coming back online on a hidden tab', () => {
    const harness = renderConnectivity()

    emitConnectivity(false)
    emitVisibilityChange('hidden')
    emitConnectivity(true)

    expect(harness.startedModes()).toEqual(['visible', 'hidden'])
  })

  it('does not start on a hidden tab while offline', () => {
    setOnline(false)
    setVisibility('hidden')

    const harness = renderConnectivity()

    expect(harness.startedModes()).toEqual([])
  })
})

describe('exposed connectivity state', () => {
  it('reports isConnected from online state alone, not visibility', () => {
    const seen: Array<{ isConnected: boolean; isVisible: boolean }> = []

    const Probe = () => {
      const { isConnected, isVisible } = useConnectivity()
      seen.push({ isConnected, isVisible })
      return null
    }

    render(
      <ConnectivityProvider>
        <Probe />
      </ConnectivityProvider>
    )

    emitVisibilityChange('hidden')

    const latest = seen[seen.length - 1]
    expect(latest.isVisible).toBe(false)
    expect(latest.isConnected).toBe(true)
  })

  it('throws outside a provider', () => {
    const Orphan = () => {
      useConnectivity()
      return null
    }
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)

    expect(() => render(<Orphan />)).toThrow(
      'useConnectivity must be used within ConnectivityProvider'
    )

    consoleError.mockRestore()
  })
})
