import React, { FC, useCallback, useEffect } from 'react'
import { DocuSignEvent, DocuSignMessage, WindowEventType } from '../../types'

interface IFrameMessager {
  iframeEvent?: DocuSignEvent
  setEvent: (event: DocuSignEvent | undefined) => void
}

export const IFrameMessager: FC<IFrameMessager> = ({
  iframeEvent,
  setEvent,
}) => {
  const isIframe = !!iframeEvent

  const handleDocuSignEvent = useCallback(
    (event: MessageEvent<DocuSignMessage>) => {
      // validate domain
      if (event.origin !== location.origin) {
        return
      }

      switch (event.data?.type) {
        case WindowEventType.DOCU_SIGN_SET_EVENT:
          setEvent(event.data.event)
          break
        default:
          break
      }
    },
    [setEvent]
  )

  useEffect(() => {
    if (isIframe) {
      window.top?.postMessage(
        { event: iframeEvent, type: WindowEventType.DOCU_SIGN_SET_EVENT },
        location.origin
      )
    } else {
      window.addEventListener('message', handleDocuSignEvent, false)

      return () => {
        window.removeEventListener('message', handleDocuSignEvent, false)
      }
    }
  }, [handleDocuSignEvent, iframeEvent, isIframe])

  return <></>
}

IFrameMessager.displayName = 'IFrameMessager'
