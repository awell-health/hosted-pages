import { createContext } from 'react'
import { Activity } from './types'

export interface ActivityContextInterface {
  currentActivity: Activity | undefined
  waitingForNewActivities: boolean
  handleNavigateToNextActivity: () => void
}

const initialContext = {
  currentActivity: undefined,
  waitingForNewActivities: true,
  handleNavigateToNextActivity: () => null,
}

export const ActivityContext =
  createContext<ActivityContextInterface>(initialContext)
