import { useContext } from 'react'
import { ActivityContext, ActivityContextInterface } from './ActivityContext'

export const useCurrentActivity = (): ActivityContextInterface =>
  useContext(ActivityContext)
