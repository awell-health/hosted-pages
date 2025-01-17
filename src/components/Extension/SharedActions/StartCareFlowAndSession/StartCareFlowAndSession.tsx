import React, { FC } from 'react'
import classes from './StartCareFlowAndSession.module.css'
import activityClasses from '../../../../../styles/ActivityLayout.module.css'

import type { ExtensionActivityRecord } from '../../types'
import { useTranslation } from 'next-i18next'
import { LoadingPage } from '../../../LoadingPage'
import { useSessionActivities } from '../../../../hooks/useSessionActivities'

interface StartCareFlowAndSessionProps {
  activityDetails: ExtensionActivityRecord
}

export const StartCareFlowAndSession: FC<StartCareFlowAndSessionProps> = () => {
  const { t } = useTranslation()
  // performing polling until the current activity is completed
  const { startPolling } = useSessionActivities()
  startPolling(2000)
  return (
    <>
      <main
        id="ahp_main_content_with_scroll_hint"
        className={activityClasses.main_content}
      >
        <LoadingPage />
        <div className={`${activityClasses.container} ${classes.redirect}`}>
          {t('activities.start_care_flow_and_session.loading_message')}
        </div>
      </main>
    </>
  )
}
