import type { PathwayActivitiesQuery } from '../../types/generated/types-orchestration'

export {
  ActivityStatus,
  useGetChecklistQuery,
  useSubmitChecklistMutation,
} from '../../types/generated/types-orchestration'

export type Activity =
  PathwayActivitiesQuery['pathwayActivities']['activities'][0]
