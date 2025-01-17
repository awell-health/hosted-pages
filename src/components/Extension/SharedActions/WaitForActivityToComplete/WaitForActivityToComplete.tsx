import React, { FC } from 'react'

import type { ExtensionActivityRecord } from '../../types'
import { useTranslation } from 'next-i18next'
import { LoadingPage } from '../../../LoadingPage'
import { useSessionActivities } from '../../../../hooks/useSessionActivities'

interface StartCareFlowAndSessionProps {
  activityDetails: ExtensionActivityRecord
}

export const WaitForActivityToComplete: FC<
  StartCareFlowAndSessionProps
> = () => {
  const { t } = useTranslation()
  // performing polling until the current activity is completed
  // the activity provider is the one that moves the page once the current activity changes
  const { startPolling } = useSessionActivities()
  startPolling(2000)
  return <LoadingPage />
}
