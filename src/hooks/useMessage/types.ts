import type { GetMessageQuery } from '../../types/generated/types-orchestration'

export {
  useGetMessageQuery,
  MessageFormat,
  ActivityObjectType,
  useMarkMessageAsReadMutation,
} from './../../types/generated/types-orchestration'
export type {
  AnswerInput,
  Activity,
} from './../../types/generated/types-orchestration'

export type Message = GetMessageQuery['message']['message']
