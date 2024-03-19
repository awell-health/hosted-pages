export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export enum ActionKey {
  REQUEST_VIDEO_VISIT = 'requestVideoVisit',
  ENTER_MEDICATION = 'enterMedication',
}

export type RequestVideoVisitActionFields = {
  deepLink?: string
}

export type EnterMedicationActionFields = {
  questionLabel?: string
}
