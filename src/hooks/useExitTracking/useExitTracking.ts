import { useEffect, useRef } from 'react'
import { HostedSessionStatus } from '../../types/generated/types-orchestration'
import { useHostedSession } from '../useHostedSession'
import { useCurrentActivity } from '../../components/Activities/hooks'
import { logger, LogEvent } from '../../utils/logging'

/**
 * Hook to track session abandonment via beforeunload and visibilitychange events.
 * Logs to Sentry when user leaves an active session.
 */
export const useExitTracking = () => {
  const { session } = useHostedSession()
  const { currentActivity } = useCurrentActivity()

  // Use refs to always have latest values in event handlers
  const sessionRef = useRef(session)
  const currentActivityRef = useRef(currentActivity)

  useEffect(() => {
    sessionRef.current = session
  }, [session])

  useEffect(() => {
    currentActivityRef.current = currentActivity
  }, [currentActivity])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const logSessionExit = (exitType: 'beforeunload' | 'visibilitychange') => {
      const currentSession = sessionRef.current
      const activity = currentActivityRef.current

      // Only log for active sessions (not completed or expired)
      if (currentSession?.status !== HostedSessionStatus.Active) {
        return
      }

      logger.warn('Session exit detected', LogEvent.SESSION_EXIT, {
        sessionStatus: currentSession?.status,
        exit_type: exitType,
        activity_id: activity?.id,
        activity_type: activity?.object?.type,
        user_agent: navigator.userAgent,
        url: window.location.href,
      })
    }

    const handleBeforeUnload = () => {
      logSessionExit('beforeunload')
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logSessionExit('visibilitychange')
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])
}
