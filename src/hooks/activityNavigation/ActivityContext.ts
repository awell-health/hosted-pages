import { createContext } from 'react'

export interface ActivityContextInterface {
  currentActivityId: string
  handleNavigateToNextActivity: () => void
}

const initialContext = {
  currentActivityId: '',
  handleNavigateToNextActivity: () => null,
}

export const ActivityContext =
  createContext<ActivityContextInterface>(initialContext)
