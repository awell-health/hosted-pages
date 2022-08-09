import { GetHostedSessionActivitiesQuery } from '../../types/generated/types-orchestration'

export {
  useOnSessionActivityCompletedSubscription,
  useOnSessionActivityUpdatedSubscription,
  useOnSessionActivityCreatedSubscription,
  useGetHostedSessionActivitiesQuery,
  ActivityObjectType,
  ActivityStatus,
  ActivityAction,
  GetHostedSessionActivitiesDocument,
} from './../../types/generated/types-orchestration'

export type {
  GetHostedSessionActivitiesQueryVariables,
  PathwayActivitiesQuery,
  GetHostedSessionActivitiesQuery,
} from '../../types/generated/types-orchestration'

export type Activity =
  GetHostedSessionActivitiesQuery['hostedSessionActivities']['activities'][0]
