import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from 'react'
import { parse } from 'query-string'
import he from 'he'
import { mapActionFieldsToObject } from '../../../utils'
import { DocuSignEvent, type EmbeddedSigningFields } from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useCompleteEmbeddedSigningAction } from './hooks/useCompleteEmbeddedSigningAction'
import { IFrameMessager } from './IFrameMessager'
import { SigningProcess } from './SigningProcess'
import { FinishedMessage } from './FinishedMessage'
import classes from './embeddedSigning.module.css'

interface EmbeddedSigningActionActionProps {
  activityDetails: ExtensionActivityRecord
}

enum SigningState {
  READY = 'ready',
  SIGNING = 'signing',
  COMPLETING = 'completing',
  COMPLETED = 'completed',
  ERROR = 'error',
}

export const EmbeddedSigningAction: FC<EmbeddedSigningActionActionProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { onSubmit } = useCompleteEmbeddedSigningAction()

  const { event: iframeEvent } =
    (parse(location.search) as { event?: DocuSignEvent }) ?? {}
  const [isIframeLoaded, setIsIframeLoaded] = useState(false)
  const [event, setEvent] = useState<DocuSignEvent | undefined>(undefined)
  const [signingState, setSigningState] = useState<SigningState>(
    SigningState.READY
  )

  const completionAttemptedRef = useRef(false)
  const isFinished = !!event
  const isIframe = !!iframeEvent

  const { signUrl } = useMemo(
    () => mapActionFieldsToObject<EmbeddedSigningFields>(fields),
    [fields]
  )

  const decodedSignUrl = he.decode(signUrl)

  const finishSigning = useCallback(
    async ({ signed, status }: { signed: boolean; status: string }) => {
      if (
        completionAttemptedRef.current ||
        signingState === SigningState.COMPLETING ||
        signingState === SigningState.COMPLETED
      ) {
        return
      }

      completionAttemptedRef.current = true
      setSigningState(SigningState.COMPLETING)

      try {
        await onSubmit(activity_id, {
          signed,
          envelopeStatus: status,
          recipientStatus: status,
          completedAt: new Date().toISOString(),
        })
        setSigningState(SigningState.COMPLETED)
      } catch (error) {
        console.error('Failed to complete signing activity:', error)
        completionAttemptedRef.current = false
        setSigningState(SigningState.ERROR)

        setTimeout(() => {
          finishSigning({ signed, status })
        }, 2000)
      }
    },
    [activity_id, onSubmit, signingState]
  )

  useEffect(() => {
    if (isFinished) {
      setIsIframeLoaded(false)

      if (event === DocuSignEvent.SIGNING_COMPLETE) {
        finishSigning({ signed: true, status: 'completed' })
      } else if (event === DocuSignEvent.CANCEL) {
        finishSigning({ signed: false, status: 'cancelled' })
      } else if (event === DocuSignEvent.DECLINE) {
        finishSigning({ signed: false, status: 'declined' })
      } else if (event === DocuSignEvent.EXCEPTION) {
        console.error('An error occurred during signing')
        setSigningState(SigningState.ERROR)
      } else if (event === DocuSignEvent.SESSION_TIMEOUT) {
        console.error('Signing session timed out')
        setSigningState(SigningState.ERROR)
      } else if (event === DocuSignEvent.TTL_EXPIRED) {
        console.error('Signing URL expired')
        setSigningState(SigningState.ERROR)
      }
    }
  }, [event, finishSigning, isFinished])

  useEffect(() => {
    if (
      signingState === SigningState.SIGNING ||
      signingState === SigningState.COMPLETING
    ) {
      const handleBeforeUnload = (e: BeforeUnloadEvent) => {
        e.preventDefault()
        e.returnValue = 'Signing in progress. Are you sure you want to leave?'
        return e.returnValue
      }

      window.addEventListener('beforeunload', handleBeforeUnload)
      return () =>
        window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [signingState])

  if (isIframe) {
    return <IFrameMessager iframeEvent={iframeEvent} setEvent={setEvent} />
  }

  return (
    <>
      <IFrameMessager iframeEvent={iframeEvent} setEvent={setEvent} />

      <div
        className={`${classes.wrapper} ${
          isIframeLoaded ? classes['flex-full'] : ''
        }`}
      >
        {isFinished ? (
          <FinishedMessage event={event} finishSigning={() => {}} />
        ) : (
          <SigningProcess
            signUrl={decodedSignUrl}
            isIframeLoaded={isIframeLoaded}
            setIsIframeLoaded={setIsIframeLoaded}
          />
        )}
      </div>
    </>
  )
}

EmbeddedSigningAction.displayName = 'EmbeddedSigningAction'
