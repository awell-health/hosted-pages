import type { GetFormResponseQuery } from '../../types/generated/types-orchestration'

export {
  GetFormResponseDocument,
  useSubmitFormResponseMutation,
} from './../../types/generated/types-orchestration'
export type { AnswerInput } from './../../types/generated/types-orchestration'

export type { Activity } from '../../hooks/useSessionActivities'

export type Answer =
  GetFormResponseQuery['formResponse']['response']['answers'][0]
