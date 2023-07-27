import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
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

export const EmbeddedSigningAction: FC<EmbeddedSigningActionActionProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { onSubmit } = useCompleteEmbeddedSigningAction()
  // visible in IFrame only
  const { event: iframeEvent } =
    (parse(location.search) as { event?: DocuSignEvent }) ?? {}
  const [isIframeLoaded, setIsIframeLoaded] = useState(false)
  const [event, setEvent] = useState<DocuSignEvent | undefined>(undefined)
  const isFinished = !!event
  const isIframe = !!iframeEvent

  const { signUrl } = useMemo(
    () => mapActionFieldsToObject<EmbeddedSigningFields>(fields),
    [fields]
  )

  /**
   * This is needed because Orchestration seems to encode string action field values
   * - Data point value: https://url.com/?signature_id=ABC&token=DEF
   * - Action field value https://url.com/?signature_id&#x3D;ABC&amp;token&#x3D;DEF
   *
   * We need the decoded action field value and he library helps us to force decode
   * the url to a valid one.
   */
  const decodedSignUrl = he.decode(signUrl)

  const finishSigning = useCallback(() => {
    onSubmit(activity_id)
  }, [activity_id, onSubmit])

  useEffect(() => {
    if (isFinished) {
      setIsIframeLoaded(false)

      if (event === DocuSignEvent.SIGNING_COMPLETE) {
        finishSigning()
      }
    }
  }, [event, finishSigning, isFinished])

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
        {!isFinished ? (
          <SigningProcess
            signUrl={decodedSignUrl}
            isIframeLoaded={isIframeLoaded}
            setIsIframeLoaded={setIsIframeLoaded}
          />
        ) : (
          <FinishedMessage event={event} finishSigning={finishSigning} />
        )}
      </div>
    </>
  )
}

EmbeddedSigningAction.displayName = 'EmbeddedSigningAction'
