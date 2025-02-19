import React, { FC, useEffect, useState } from 'react'
import { useCurrentActivity } from './hooks'
import { LoadingPage } from '../LoadingPage'
import { ActivityFactory } from './ActivityFactory'
import { SuccessPage } from '../SuccessPage'
import { useTranslation } from 'next-i18next'

const WAITING_FOR_ACTIVITIES_DELAY = 10000

/**
 * This component is used to display the activities for a hosted session.
 * It will display a loading page if the activities are not yet available.
 * If the activities are not available after 10 seconds, it will display a success page.
 */
export const Activities: FC = () => {
  const { currentActivity, waitingForNewActivities } = useCurrentActivity()
  const [noActivities, setNoActivities] = useState(false)
  const { t } = useTranslation()
  useEffect(() => {
    let noActivitiesTimer: NodeJS.Timeout
    if (waitingForNewActivities) {
      noActivitiesTimer = setTimeout(() => {
        setNoActivities(true)
      }, WAITING_FOR_ACTIVITIES_DELAY)
    }

    // clear interval on component unmount
    return () => {
      if (noActivitiesTimer) {
        clearTimeout(noActivitiesTimer)
      }
    }
  }, [waitingForNewActivities])

  if (noActivities) {
    return (
      <SuccessPage
        redirect={false}
        description={t('session.no_more_pending_activities')}
      />
    )
  }

  if (waitingForNewActivities) {
    return <LoadingPage />
  }

  return <ActivityFactory activity={currentActivity} />
}
