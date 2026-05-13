import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import * as Sentry from '@sentry/nextjs'

import { LogEvent } from '../utils/logging'

type Connectivity = {
  isOnline: boolean
  isVisible: boolean
  isConnected: boolean
  registerPollingTask: (task: {
    start: () => void
    stop: () => void
  }) => () => void
}

const ConnectivityContext = createContext<Connectivity | undefined>(undefined)

export const ConnectivityProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true)
  const [isVisible, setIsVisible] = useState<boolean>(true)

  const registerPollingTask = useCallback(
    (task: { start: () => void; stop: () => void }) => {
      Sentry.logger?.info('Polling task registered', {
        event_type: LogEvent.SESSION_POLLING_TASK_REGISTERED,
        timestamp: new Date().toISOString(),
        isOnline,
        isVisible,
      })
      if (isOnline && isVisible) task.start()
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
    const isConnected = isOnline && isVisible
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
