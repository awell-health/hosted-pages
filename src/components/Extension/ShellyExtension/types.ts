export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export type ShellyExtensionSettings = {
  apiKey?: string
  environment: 'production' | 'staging'
}

export enum ActionKey {
  REVIEW_MEDICATION_EXTRACTION = 'reviewMedicationExtraction',
}

export type CompleteFlowFields = {
  clientLabel: string
  flowLabel: string
  variantLabel?: string
}
