import { createContext } from 'react'
import { Activity } from '../types'

export interface ActivityContextInterface {
  currentActivity: Activity | undefined
  waitingForNewActivities: boolean
}

const initialContext: ActivityContextInterface = {
  currentActivity: undefined,
  waitingForNewActivities: true,
}

export const ActivityContext =
  createContext<ActivityContextInterface>(initialContext)
