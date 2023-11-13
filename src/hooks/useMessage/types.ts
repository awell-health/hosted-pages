import type { GetMessageQuery } from '../../types/generated/types-orchestration'

export {
  useGetMessageQuery,
  useMarkMessageAsReadMutation,
} from './../../types/generated/types-orchestration'

export type { Activity } from '../../types'
export type Message = GetMessageQuery['message']['message']
