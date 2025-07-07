import { useCallback, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { toast } from 'react-toastify'
import { captureException } from '@sentry/nextjs'
import { useCompleteSessionMutation } from './types'

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
          captureException(error, {
            contexts: {
              session: {
                session_id,
              },
              graphql: {
                query: 'CompleteSession',
                variables: JSON.stringify(variables),
              },
            },
          })
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
