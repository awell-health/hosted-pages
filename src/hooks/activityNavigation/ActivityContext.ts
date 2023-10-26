import { createContext } from 'react'
import { Activity } from './types'
import { Maybe } from '../../../types'

export interface ActivityContextInterface {
  currentActivity: Maybe<Activity>
  waitingForNewActivities: boolean
  handleNavigateToNextActivity: () => void
}

const initialContext = {
  currentActivity: null,
  waitingForNewActivities: true,
  handleNavigateToNextActivity: () => null,
}

export const ActivityContext =
  createContext<ActivityContextInterface>(initialContext)
