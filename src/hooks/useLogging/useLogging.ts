import { useAuthentication } from '../../services/authentication'
import { useHostedSession } from '../useHostedSession'
import { LogSeverity } from './types'

interface UseLoggingHook {
  log: (message: {}, severity: LogSeverity) => void
  infoLog: (message: {}) => void
  warningLog: (message: {}) => void
  errorLog: (message: {}, error: string | {}) => void
}

export const useLogging = (): UseLoggingHook => {
  const authContext = useAuthentication()
  const { session } = useHostedSession()

  const log = async (
    params: {},
    severity: LogSeverity,
    error?: string | {}
  ): Promise<void> => {
    await fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        params: { ...params, authContext, session },
        severity,
        error,
      }),
    })
  }

  const infoLog = async (params: {}): Promise<void> => {
    await log(params, 'INFO')
  }

  const warningLog = async (params: {}): Promise<void> => {
    await log(params, 'WARNING')
  }

  const errorLog = async (params: {}, error: string | {}): Promise<void> => {
    await log(params, 'ERROR', error)
  }

  return {
    log,
    infoLog,
    warningLog,
    errorLog,
  }
}
