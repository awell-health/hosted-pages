import type { GetFormQuery } from '../../types/generated/types-orchestration'
export type {
  Question,
  GetFormResponseQuery,
  GetFormQuery,
} from './../../types/generated/types-orchestration'

export {
  QuestionType,
  useGetFormQuery,
  GetFormDocument,
} from './../../types/generated/types-orchestration'

export type { Activity } from '../../types'
export type Form = GetFormQuery['form']['form']
