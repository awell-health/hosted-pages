import { createContext } from 'react'

export interface ActivityContextInterface {
  currentActivity: number
  handleNavigateToNextActivity: () => void
}

const initialContext = {
  currentActivity: 0,
  handleNavigateToNextActivity: () => null,
}

export const ActivityContext =
  createContext<ActivityContextInterface>(initialContext)
