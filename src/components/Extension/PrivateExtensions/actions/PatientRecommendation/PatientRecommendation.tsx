import React, { FC, useCallback, useMemo } from 'react'
import classes from './PatientRecommendation.module.css'
import activityClasses from '../../../../../../styles/ActivityLayout.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { usePatientRecommendation } from './hooks/usePatientRecommendation'
import {
  Button,
  HostedPageFooter,
  RichTextViewer,
  useScrollHint,
} from '@awell-health/ui-library'
import { mapActionFieldsToObject } from '../../../utils'
import { ActionFields } from './types'

interface PatientRecommendationProps {
  activityDetails: ExtensionActivityRecord
}

export const PatientRecommendation: FC<PatientRecommendationProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { onSubmit } = usePatientRecommendation()
  const { showScrollHint } = useScrollHint()

  const {
    title,
    message,
    acceptRecommendationButtonLabel,
    discardRecommendationButtonLabel,
  } = useMemo(() => mapActionFieldsToObject<ActionFields>(fields), [fields])

  const handleCompletion = useCallback(
    ({ acceptRecommendation }: { acceptRecommendation: boolean }) => {
      onSubmit({ activityId: activity_id, acceptRecommendation })
    },
    [activity_id, onSubmit]
  )

  return (
    <>
      <main
        id="ahp_main_content_with_scroll_hint"
        className={activityClasses.main_content}
      >
        <article className={`${classes.message} ${activityClasses.container}`}>
          <div className={classes.title}>{title}</div>
          <div className={classes.content}>
            <RichTextViewer content={message} />
          </div>
        </article>
      </main>
      <HostedPageFooter showScrollHint={showScrollHint}>
        <div
          className={`${classes.button_wrapper} ${activityClasses.container}`}
        >
          <Button
            variant="tertiary"
            onClick={() => handleCompletion({ acceptRecommendation: false })}
          >
            {discardRecommendationButtonLabel}
          </Button>
          <Button
            variant="primary"
            onClick={() => handleCompletion({ acceptRecommendation: true })}
          >
            {acceptRecommendationButtonLabel}
          </Button>
        </div>
      </HostedPageFooter>
    </>
  )
}

PatientRecommendation.displayName = 'PatientRecommendation'
