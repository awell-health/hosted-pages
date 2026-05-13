import { useEffect, useRef } from 'react'
import { HostedSessionStatus } from '../../types/generated/types-orchestration'
import { useHostedSession } from '../useHostedSession'
import { useCurrentActivity } from '../../components/Activities/hooks'
import { logger, LogEvent } from '../../utils/logging'

/**
 * Hook to track active sessions moving out of view or unloading.
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

    const getActiveSessionContext = () => {
      const currentSession = sessionRef.current
      const activity = currentActivityRef.current

      // Only log for active sessions (not completed or expired)
      if (currentSession?.status !== HostedSessionStatus.Active) {
        return null
      }

      return {
        sessionStatus: currentSession.status,
        activity_id: activity?.id,
        activity_type: activity?.object?.type,
        user_agent: navigator.userAgent,
        url: window.location.href,
      }
    }

    const logSessionExit = () => {
      const context = getActiveSessionContext()
      if (context === null) return

      logger.warn('Session exit detected', LogEvent.SESSION_EXIT, {
        exit_type: 'beforeunload',
        ...context,
      })
    }

    const logSessionHidden = () => {
      const context = getActiveSessionContext()
      if (context === null) return

      logger.info('Session hidden', LogEvent.SESSION_HIDDEN, {
        visibility_state: document.visibilityState,
        ...context,
      })
    }

    const handleBeforeUnload = () => {
      logSessionExit()
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logSessionHidden()
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
