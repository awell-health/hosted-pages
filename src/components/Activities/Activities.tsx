/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react'
import { useCurrentActivity } from './hooks'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { ActivityFactory } from './ActivityFactory'

// session will already expire after 15 seconds
const TIMEOUT_DELAY = 10000
const RELOAD_DELAY = 20000

export const Activities: FC = () => {
  const { currentActivity, waitingForNewActivities } = useCurrentActivity()
  const { t } = useTranslation()
  const initialMessage = t('activities.waiting_for_new_activities')
  const unexpectedMessage = t('activities.waiting_unexpected')
  const [message, setMessage] = useState<string>(initialMessage)

  useEffect(() => {
    let timeoutTimer: NodeJS.Timeout
    let reloadTimer: NodeJS.Timeout
    if (waitingForNewActivities) {
      timeoutTimer = setTimeout(() => {
        setMessage(unexpectedMessage)
      }, TIMEOUT_DELAY)
      reloadTimer = setTimeout(() => {
        window.location.reload()
      }, RELOAD_DELAY)
    }

    // clear interval on component unmount
    return () => {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer)
      }
      if (reloadTimer) {
        clearTimeout(reloadTimer)
      }
    }
  }, [waitingForNewActivities])

  if (waitingForNewActivities) {
    return <LoadingPage title={message} />
  }

  return <ActivityFactory activity={currentActivity} />
}
