import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as Sentry from '@sentry/nextjs'

import type { PollingMode } from '../config/polling'
import { LogEvent } from '../utils/logging'

export type PollingTask = {
  /**
   * Called with the mode that applies right now. Re-invoked with a new mode when
   * visibility changes, so consumers can pick a different interval rather than
   * having their polling torn down.
   */
  start: (_mode: PollingMode) => void
  stop: () => void
}

type Connectivity = {
  isOnline: boolean
  isVisible: boolean
  isConnected: boolean
  registerPollingTask: (_task: PollingTask) => () => void
}

const ConnectivityContext = createContext<Connectivity | undefined>(undefined)

export const ConnectivityProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  // Read the real state on the first render rather than assuming online/visible.
  // Assuming otherwise makes the very first registration fire a fast-interval poll
  // that is immediately torn down — a wasted request when the page is loaded
  // offline, and a needless 2s burst when it is restored into a background tab.
  const [isOnline, setIsOnline] = useState<boolean>(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine
  )
  const [isVisible, setIsVisible] = useState<boolean>(() =>
    typeof document === 'undefined'
      ? true
      : document.visibilityState === 'visible'
  )

  const registerPollingTask = useCallback(
    (task: PollingTask) => {
      const pollingMode: PollingMode = isVisible ? 'visible' : 'hidden'
      Sentry.logger?.info('Polling task registered', {
        event_type: LogEvent.SESSION_POLLING_TASK_REGISTERED,
        timestamp: new Date().toISOString(),
        isOnline,
        isVisible,
        pollingMode,
      })
      // Visibility only selects the interval; being offline is what stops polling.
      if (isOnline) task.start(pollingMode)
      return () => {
        try {
          task.stop()
        } finally {
          Sentry.logger?.info('Polling task unregistered', {
            event_type: LogEvent.SESSION_POLLING_TASK_UNREGISTERED,
            timestamp: new Date().toISOString(),
            isOnline,
            isVisible,
          })
        }
      }
    },
    [isOnline, isVisible]
  )

  // Log provider mount/unmount exactly once
  useEffect(() => {
    Sentry.logger?.info('ConnectivityProvider mounted', {
      event_type: LogEvent.CONNECTIVITY_PROVIDER_MOUNTED,
      timestamp: new Date().toISOString(),
    })
    return () => {
      Sentry.logger?.info('ConnectivityProvider unmounted', {
        event_type: LogEvent.CONNECTIVITY_PROVIDER_UNMOUNTED,
        timestamp: new Date().toISOString(),
      })
    }
  }, [])

  // Log connectivity state transitions independent of where they originated
  useEffect(() => {
    Sentry.logger?.info('Connectivity state changed', {
      event_type: LogEvent.CONNECTIVITY_STATE_CHANGED,
      timestamp: new Date().toISOString(),
      isOnline,
      isVisible,
    })
  }, [isOnline, isVisible])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleOnline = () => {
      setIsOnline(true)

      // Note: Using Sentry.logger directly because ConnectivityContext doesn't have session context
      // This is a low-level infrastructure component that runs before session is available
      Sentry.logger?.info('Network connectivity restored', {
        event_type: 'CONNECTIVITY_ONLINE',
        timestamp: new Date().toISOString(),
      })
    }
    const handleOffline = () => {
      setIsOnline(false)

      // Note: Using Sentry.logger directly because ConnectivityContext doesn't have session context
      Sentry.logger?.warn('Network connectivity lost', {
        event_type: 'CONNECTIVITY_OFFLINE',
        timestamp: new Date().toISOString(),
      })
    }
    const handleVisibility = () => {
      const visible = document.visibilityState === 'visible'
      setIsVisible(visible)
      Sentry.logger?.info('Visibility changed', {
        event_type: LogEvent.CONNECTIVITY_VISIBILITY_CHANGED,
        timestamp: new Date().toISOString(),
        isVisible: visible,
        isOnline,
      })
    }

    setIsOnline(navigator.onLine)
    setIsVisible(document.visibilityState === 'visible')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [isOnline])

  const value = useMemo<Connectivity>(() => {
    const isConnected = isOnline
    return { isOnline, isVisible, isConnected, registerPollingTask }
  }, [isOnline, isVisible, registerPollingTask])

  return (
    <ConnectivityContext.Provider value={value}>
      {children}
    </ConnectivityContext.Provider>
  )
}

export const useConnectivity = () => {
  const ctx = useContext(ConnectivityContext)
  if (!ctx) {
    throw new Error('useConnectivity must be used within ConnectivityProvider')
  }
  return ctx
}
