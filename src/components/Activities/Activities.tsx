import React, { FC, useEffect } from 'react'
import { useCurrentActivity } from './hooks'
import { LoadingPage } from '../LoadingPage'
import { ActivityFactory } from './ActivityFactory'

// session will already expire after 15 seconds
const RELOAD_DELAY = 20000

export const Activities: FC = () => {
  const { currentActivity, waitingForNewActivities } = useCurrentActivity()

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
