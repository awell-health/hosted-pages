import { useCallback, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import { useCompleteSessionMutation } from './types'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'

interface UseCompleteSessionHook {
  onCompleteSession: (session_id: string) => Promise<void>
  isCompleting: boolean
}

export const useCompleteSession = (): UseCompleteSessionHook => {
  const { t } = useTranslation()
  const [isCompleting, setIsCompleting] = useState(false)
  const [completeSession] = useCompleteSessionMutation()

  const onCompleteSession: UseCompleteSessionHook['onCompleteSession'] =
    useCallback(
      async (session_id) => {
        setIsCompleting(true)
        const variables = {
          input: {
            session_id,
          },
        }
        try {
          await completeSession({ variables })
        } catch (error) {
          toast.error(t('session.completion_error'))
          const hostedSessionError = new HostedSessionError(
            'Failed to complete session',
            {
              errorType: 'SESSION_COMPLETION_FAILED',
              operation: 'CompleteSession',
              originalError: error,
              contexts: {
                session: {
                  session_id,
                },
                graphql: {
                  query: 'CompleteSession',
                  variables: JSON.stringify(variables),
                },
              },
            }
          )
          captureHostedSessionError(hostedSessionError)
        } finally {
          setIsCompleting(false)
        }
      },
      [completeSession, t]
    )

  return {
    onCompleteSession,
    isCompleting,
  }
}
