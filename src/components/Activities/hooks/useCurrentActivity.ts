import { useContext } from 'react'
import { ActivityContext, ActivityContextInterface } from '../context'

export const useCurrentActivity = (): ActivityContextInterface =>
  useContext(ActivityContext)
