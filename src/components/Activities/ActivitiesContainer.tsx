import React from 'react'
import { ActivityProvider } from './context'
import { Activities } from './Activities'

export const ActivitiesContainer = () => {
  return (
    <ActivityProvider>
      <div className="sentry-mask">
        <Activities />
      </div>
    </ActivityProvider>
  )
}
