import React, { FC, useCallback, useEffect, useMemo } from 'react'
import classes from './Redirect.module.css'
import activityClasses from '../../../../../styles/ActivityLayout.module.css'

import type { ExtensionActivityRecord } from '../../types'
import { useRedirect } from './hooks/useRedirect'
import { mapActionFieldsToObject } from '../../utils'
import { ActionFields } from './types'
import { isEmpty } from 'lodash'
import { RichTextViewer } from '@awell-health/ui-library'
import { toSafeRedirectUrl } from './toSafeRedirectUrl'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../../../utils/errors'

interface RedirectProps {
  activityDetails: ExtensionActivityRecord
}

export const Redirect: FC<RedirectProps> = ({ activityDetails }) => {
  const { activity_id, fields } = activityDetails
  const { onSubmit } = useRedirect()

  const { redirectUrl, redirectMessage } = useMemo(
    () => mapActionFieldsToObject<ActionFields>(fields),
    [fields]
  )

  // Only http(s) destinations are followed; see toSafeRedirectUrl for why. The activity is still
  // completed either way so the care flow moves on — a refused destination is reported, not fatal.
  const safeRedirectUrl = useMemo(
    () => toSafeRedirectUrl(redirectUrl),
    [redirectUrl]
  )

  const handleCompletion = useCallback(async () => {
    await onSubmit({ activityId: activity_id })
    if (safeRedirectUrl === null) {
      captureHostedSessionError(
        new HostedSessionError('Redirect action refused a non-http(s) URL', {
          errorType: 'REDIRECT_URL_REFUSED',
          activityId: activity_id,
          level: 'warning',
        })
      )
      return
    }
    // nosemgrep: AIK_js_xss_location
    window.location.href = safeRedirectUrl
  }, [activity_id, onSubmit, safeRedirectUrl])

  useEffect(() => {
    // If redirectMessage is empty, redirect immediately.
    const emptyHtml = `<p class=\"slate-p\"></p>`
    if (isEmpty(redirectMessage) || redirectMessage === emptyHtml) {
      handleCompletion()
    } else {
      const SECONDS_BEFORE_REDIRECT = 2
      const timer = setTimeout(() => {
        handleCompletion()
      }, SECONDS_BEFORE_REDIRECT * 1000)

      // Cleanup the timer if the component unmounts before the timeout is reached
      return () => clearTimeout(timer)
    }
  }, [handleCompletion, redirectMessage])

  return (
    <>
      <main
        id="ahp_main_content_with_scroll_hint"
        className={activityClasses.main_content}
      >
        <div className={`${activityClasses.container} ${classes.redirect}`}>
          {!isEmpty(redirectMessage) && (
            <RichTextViewer content={redirectMessage ?? ''} />
          )}
        </div>
      </main>
    </>
  )
}
