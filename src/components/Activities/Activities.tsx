import React, { FC } from 'react'
import { useCurrentActivity } from '../../hooks/activityNavigation'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { ActivityFactory } from './ActivityFactory'

export const Activities: FC = () => {
  const { currentActivity, waitingForNewActivities } = useCurrentActivity()
  const { t } = useTranslation()

  if (waitingForNewActivities) {
    return <LoadingPage title={t('activities.waiting_for_new_activities')} />
  }

  return <ActivityFactory activity={currentActivity} />
}
