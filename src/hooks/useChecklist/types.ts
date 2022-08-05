export {
  ActivityStatus,
  useGetChecklistQuery,
  useSubmitChecklistMutation,
} from '../../types/generated/types-orchestration'

export type { Activity } from '../../types/generated/types-orchestration'
export interface ChecklistItem {
  id: string
  label: string
}
