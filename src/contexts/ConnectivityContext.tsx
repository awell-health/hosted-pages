import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

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
  const pollingTasksRef = useRef(
    new Set<{ start: () => void; stop: () => void }>()
  )

  const registerPollingTask = useCallback(
    (task: { start: () => void; stop: () => void }) => {
      pollingTasksRef.current.add(task)
      // If currently connected, start immediately
      if (isOnline && isVisible) task.start()
      return () => {
        try {
          task.stop()
        } finally {
          pollingTasksRef.current.delete(task)
        }
      }
    },
    [isOnline, isVisible]
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    const handleOnline = () => {
      setIsOnline(true)
      // Start all registered pollers
      pollingTasksRef.current.forEach((t) => t.start())
    }
    const handleOffline = () => {
      setIsOnline(false)
      // Stop all registered pollers
      pollingTasksRef.current.forEach((t) => t.stop())
    }
    const handleVisibility = () => {
      const visible = document.visibilityState === 'visible'
      setIsVisible(visible)
      // Toggle pollers with visibility as well
      if (visible && isOnline) {
        pollingTasksRef.current.forEach((t) => t.start())
      } else {
        pollingTasksRef.current.forEach((t) => t.stop())
      }
    }

    setIsOnline(navigator.onLine)
    setIsVisible(document.visibilityState === 'visible')
    if (navigator.onLine && document.visibilityState === 'visible') {
      pollingTasksRef.current.forEach((t) => t.start())
    }

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
