import { useAuthentication } from '../../services/authentication'
import { useHostedSession } from '../useHostedSession'
import { LogEvent, LogSeverity } from './types'

interface UseLoggingHook {
  log: (
    message: string,
    params: {},
    severity: LogSeverity,
    event: LogEvent,
    error?: string | {}
  ) => void
  infoLog: (message: string, params: {}, event: LogEvent) => void
  warningLog: (message: string, params: {}, event: LogEvent) => void
  errorLog: (
    message: string,
    params: {},
    error: string | {},
    event: LogEvent
  ) => void
}

export const useLogging = (): UseLoggingHook => {
  const authContext = useAuthentication()
  const { session, metadata } = useHostedSession()

  const log = async (
    message: string,
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
        message: `[${event}] [${session?.id}] ${message}`,
        params: { ...params, authContext, session, metadata, event },
        client_timestamp: new Date().toISOString(),
        severity,
        error,
      }),
    })
  }

  const infoLog = async (
    message: string,
    params: {},
    event: LogEvent
  ): Promise<void> => {
    console.log('infoLog', params, event)
    await log(message, params, 'INFO', event)
  }

  const warningLog = async (
    message: string,
    params: {},
    event: LogEvent
  ): Promise<void> => {
    console.warn('warningLog', params, event)
    await log(message, params, 'WARNING', event)
  }

  const errorLog = async (
    message: string,
    params: {},
    error: string | {},
    event: LogEvent
  ): Promise<void> => {
    console.error('errorLog', params, error, event)
    await log(message, params, 'ERROR', event, error)
  }

  return {
    log,
    infoLog,
    warningLog,
    errorLog,
  }
}
