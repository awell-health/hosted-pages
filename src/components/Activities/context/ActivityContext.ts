import { createContext } from 'react'
import { Activity } from '../types'

export interface ActivityContextInterface {
  currentActivity: Activity | undefined
  state:
    | 'polling'
    | 'polling-extended'
    | 'active-activity-found'
    | 'no-active-activity'
}

const initialContext: ActivityContextInterface = {
  currentActivity: undefined,
  state: 'polling',
}

export const ActivityContext =
  createContext<ActivityContextInterface>(initialContext)
