export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../../../hooks/useCompleteExtensionActivity'

export type ActionFields = {
  patientName: string
  patientEmail: string
  deliveryMethodPreference: 'Virtual' | 'In-Person' | 'Hybrid'
  locationFacilityPreference: 'f1' | 'f2' | 'f3'
  locationStatePreference: string
  agePreference: '18-25' | '26-50' | '50-60'
  genderPreference: 'M' | 'F'
  languagePreference: 'en' | 'sp' | 'fr' | 'de' | 'it'
  therapeuticModalityPreference: 'Psychiatry' | 'Therapy'
  clinicalFocusPreference: (
    | 'Panic Disorder'
    | 'Acute Stress'
    | 'Generalized Anxiety'
  )[]
  ethnicityPreference: 'Hispanic' | 'Caucasian' | 'African American'
}
