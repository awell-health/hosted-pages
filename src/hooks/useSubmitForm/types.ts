import type {
  GetFormResponseQuery,
  PathwayActivitiesQuery,
} from '../../types/generated/types-orchestration'

export {
  GetFormResponseDocument,
  useSubmitFormResponseMutation,
} from './../../types/generated/types-orchestration'
export type { AnswerInput } from './../../types/generated/types-orchestration'

export type Activity =
  PathwayActivitiesQuery['pathwayActivities']['activities'][0]

export type Answer =
  GetFormResponseQuery['formResponse']['response']['answers'][0]
