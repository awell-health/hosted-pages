import React, { FC, useEffect } from 'react'

import type { ExtensionActivityRecord } from '../../types'
import { LoadingPage } from '../../../LoadingPage'
import { useSessionActivities } from '../../../../hooks/useSessionActivities'

interface StartCareFlowAndSessionProps {
  activityDetails: ExtensionActivityRecord
}

export const WaitForActivityToComplete: FC<
  StartCareFlowAndSessionProps
> = () => {
  // performing polling until the current activity is completed
  // the activity provider is the one that moves the page once the current activity changes
  const { startPolling, stopPolling } = useSessionActivities()
  useEffect(() => {
    startPolling(2000)
    return () => stopPolling()
  }, [])
  return <LoadingPage />
}
