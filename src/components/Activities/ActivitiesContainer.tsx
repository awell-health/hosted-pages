import React from 'react'
import { ActivityProvider } from '../../hooks/activityNavigation'
import { Activities } from './Activities'

export const ActivitiesContainer = () => {
  return (
    <ActivityProvider>
      <Activities />
    </ActivityProvider>
  )
}
