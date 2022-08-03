import type { GetHostedSessionQuery } from '../../types/generated/types-orchestration'
export type { GetFormResponseQuery } from './../../types/generated/types-orchestration'

export { useGetHostedSessionQuery } from './../../types/generated/types-orchestration'

export type HostedSession = GetHostedSessionQuery['hostedSession']['session']
