import { GetExtensionActivityDetailsQuery } from '../../types/generated/types-orchestration'

export type { Activity } from '../../hooks/useSessionActivities'
export type ExtensionActivityRecord =
  GetExtensionActivityDetailsQuery['extensionActivityRecord']['record']

export type ExtensionActivityRecordSettings =
  GetExtensionActivityDetailsQuery['extensionActivityRecord']['record']['settings']

export enum ExtensionKey {
  CAL_DOT_COM = 'calDotCom',
  FORMSORT = 'formsort',
  DROPBOXSIGN = 'dropboxSign',
  CLOUDINARY = 'cloudinary',
  DOCU_SIGN = 'docuSign',
}
