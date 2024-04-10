/* eslint-disable react-hooks/exhaustive-deps */
import React, { FC, useEffect, useState } from 'react'
import { useCurrentActivity } from './hooks'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { ActivityFactory } from './ActivityFactory'

// session will already expire after 15 seconds
const RELOAD_DELAY = 20000

export const Activities: FC = () => {
  const { currentActivity, waitingForNewActivities } = useCurrentActivity()
  const { t } = useTranslation()

  useEffect(() => {
    let reloadTimer: NodeJS.Timeout
    if (waitingForNewActivities) {
      reloadTimer = setTimeout(() => {
        window.location.reload()
      }, RELOAD_DELAY)
    }

    // clear interval on component unmount
    return () => {
      if (reloadTimer) {
        clearTimeout(reloadTimer)
      }
    }
  }, [waitingForNewActivities])

  if (waitingForNewActivities) {
    return <LoadingPage />
  }

  return <ActivityFactory activity={currentActivity} />
}
