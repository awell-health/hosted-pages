import { useAuthentication } from '../../services/authentication'
import { useHostedSession } from '../useHostedSession'
import { LogEvent, LogSeverity } from './types'

interface UseLoggingHook {
  log: (message: {}, severity: LogSeverity, event: LogEvent) => void
  infoLog: (message: {}, event: LogEvent) => void
  warningLog: (message: {}, event: LogEvent) => void
  errorLog: (message: {}, error: string | {}, event: LogEvent) => void
}

export const useLogging = (): UseLoggingHook => {
  const authContext = useAuthentication()
  const { session } = useHostedSession()

  const log = async (
    params: {},
    severity: LogSeverity,
    event: LogEvent,
    error?: string | {}
  ): Promise<void> => {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params: { ...params, authContext, session, event },
        severity,
        error,
      }),
    })
  }

  const infoLog = async (params: {}, event: LogEvent): Promise<void> => {
    await log(params, 'INFO', event)
  }

  const warningLog = async (params: {}, event: LogEvent): Promise<void> => {
    await log(params, 'WARNING', event)
  }

  const errorLog = async (
    params: {},
    error: string | {},
    event: LogEvent
  ): Promise<void> => {
    await log(params, 'ERROR', event, error)
  }

  return {
    log,
    infoLog,
    warningLog,
    errorLog,
  }
}
