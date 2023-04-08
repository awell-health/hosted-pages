import { GetExtensionActivityDetailsQuery } from '../../types/generated/types-orchestration'

export type { Activity } from '../../hooks/useSessionActivities'
export type ExtensionActivityRecord =
  GetExtensionActivityDetailsQuery['extensionActivityRecord']['record']

export enum ExtensionKey {
  CAL_DOT_COM = 'calDotCom',
  FORMSORT = 'formsort',
}
