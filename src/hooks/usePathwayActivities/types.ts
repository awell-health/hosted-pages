import { PathwayActivitiesQuery } from '../../types/generated/types-orchestration'

export {
  usePathwayActivitiesQuery,
  useOnActivityCompletedSubscription,
  useOnActivityCreatedSubscription,
  useOnActivityUpdatedSubscription,
  PathwayActivitiesDocument,
  ActivityObjectType,
  ActivityStatus,
  ActivityAction,
} from './../../types/generated/types-orchestration'

export type {
  PathwayActivitiesQueryVariables,
  PathwayActivitiesQuery,
} from '../../types/generated/types-orchestration'

export type Activity =
  PathwayActivitiesQuery['pathwayActivities']['activities'][0]
