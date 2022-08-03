import type { GetFormQuery } from '../../types/generated/types-orchestration'
export type {
  Question,
  GetFormResponseQuery,
  GetFormQuery,
  Activity,
} from './../../types/generated/types-orchestration'

export {
  QuestionType,
  ActivityStatus,
  useGetFormQuery,
} from './../../types/generated/types-orchestration'

export type Form = GetFormQuery['form']['form']
