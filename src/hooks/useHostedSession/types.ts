import type { GetHostedSessionQuery as GetHostedSessionQueryType } from '../../types/generated/types-orchestration'
export type {
  GetFormResponseQuery,
  BrandingSettings,
} from './../../types/generated/types-orchestration'

export {
  useGetHostedSessionQuery,
  useOnHostedSessionCompletedSubscription,
  useOnHostedSessionExpiredSubscription,
  GetHostedSessionDocument,
} from './../../types/generated/types-orchestration'

export type GetHostedSessionQuery = GetHostedSessionQueryType

export type HostedSession =
  GetHostedSessionQueryType['hostedSession']['session']
