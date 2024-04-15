import React, { FC, useCallback, useEffect, useMemo } from 'react'
import classes from './Redirect.module.css'
import activityClasses from '../../../../../../styles/ActivityLayout.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useRedirect } from './hooks/useRedirect'
import { mapActionFieldsToObject } from '../../../utils'
import { ActionFields } from './types'
import { isEmpty } from 'lodash'
import { RichTextViewer } from '@awell-health/ui-library'

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

  const handleCompletion = useCallback(async () => {
    await onSubmit({ activityId: activity_id })
    window.location.href = redirectUrl
  }, [activity_id, onSubmit, redirectUrl])

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
