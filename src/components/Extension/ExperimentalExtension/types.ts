export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export enum ActionKey {
  REQUEST_VIDEO_VISIT = 'requestVideoVisit',
  ENTER_MEDICATION = 'enterMedication',
  REDIRECT = 'redirect',
}

export type RequestVideoVisitActionFields = {
  deepLink?: string
}

export type EnterMedicationActionFields = {
  label?: string
}
