/* eslint-disable react-hooks/exhaustive-deps */
import { isNil, isEmpty } from 'lodash'
import React, { FC, useEffect, useState } from 'react'
import { ActivityStatus } from '../useForm'
import { ActivityContext } from './ActivityContext'
import { Activity } from './types'
import { useSessionActivities } from '../useSessionActivities'
import { useTranslation } from 'next-i18next'
import { ErrorPage, LoadingPage } from '../../components'

interface ActivityProviderProps {
  children?: React.ReactNode
}
/**
 * Provider to store ID of the current activity being shown to user
 * and to determine the next activity from the activities list.
 */
export const ActivityProvider: FC<ActivityProviderProps> = ({ children }) => {
  const { t } = useTranslation()
  const [currentActivity, setCurrentActivity] = useState<Activity>()
  const { activities, loading, error, refetch } = useSessionActivities({
    onlyStakeholderActivities: true,
  })

  const findNextActiveActivity = (): Activity | undefined => {
    return activities.find(
      ({ status, id }) =>
        status === ActivityStatus.Active && id !== currentActivity?.id
    )
  }
  const findCurrentActivity = (): Activity | undefined => {
    if (isEmpty(activities) || isNil(currentActivity)) {
      return undefined
    }
    return activities.find(({ id }) => id === currentActivity.id)
  }

  const handleSetCurrent = () => {
    // refetching current activity because it might have changed in the activities list via useEffect
    const current = findCurrentActivity()
    // if current activity is still active, then do not move
    // to the next activity unless it is marked as completed
    if (current?.status === ActivityStatus.Active) {
      return
    }

    const nextActivity = findNextActiveActivity()
    if (!isNil(nextActivity)) {
      setCurrentActivity(nextActivity)
    }
  }

  useEffect(() => {
    handleSetCurrent()
  }, [activities])

  if (loading) {
    return <LoadingPage title={t('activities.loading')} />
  }

  if (error) {
    return <ErrorPage title={t('activities.loading_error')} onRetry={refetch} />
  }

  const pendingActivities = activities.filter(
    (activity) => activity.status === ActivityStatus.Active
  )

  const waitingForNewActivities =
    isNil(currentActivity) || pendingActivities.length === 0

  return (
    <ActivityContext.Provider
      value={{
        currentActivity,
        waitingForNewActivities,
        handleNavigateToNextActivity: handleSetCurrent,
      }}
    >
      {children}
    </ActivityContext.Provider>
  )
}
