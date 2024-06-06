export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export enum ActionKey {
  REMOTE_SINGLE_SELECT = 'remoteSingleSelect',
  COLLECT_MEDICATION = 'collectMedication',
}

export type RemoteSingleSelectActionFields = {
  label: string
  url: string
  headers?: string
  queryParam: string
  mandatory?: string
}

export type CollectMedicationActionFields = {
  label?: string
}
