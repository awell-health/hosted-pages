import { createContext } from 'react'
import { Activity } from '../types'

export interface ActivityContextInterface {
  currentActivity: Activity | undefined
  waitingForNewActivities: boolean
  unsetCurrentActivity: () => void
}

const initialContext: ActivityContextInterface = {
  currentActivity: undefined,
  waitingForNewActivities: true,
  unsetCurrentActivity: () => {},
}

export const ActivityContext =
  createContext<ActivityContextInterface>(initialContext)
