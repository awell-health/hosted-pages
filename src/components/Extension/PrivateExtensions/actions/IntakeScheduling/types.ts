export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../../../hooks/useCompleteExtensionActivity'

export type ActionFields = {
  patientName: string
  agePreference?: number | undefined
  genderPreference?: 'M' | 'F' | undefined
  ethnicityPreference?: 'Hispanic' | 'White' | 'African American' | undefined
  therapeuticModalityPreference?: 'Psychiatric' | 'Therapy' | undefined
  clinicalFocusPreference?: string | undefined // we receive it as a string although it's an array of strings
  // clinicalFocusPreference?:
  //   | ('ADHD' | 'Anxiety d/o' | 'Autism spectrum' | 'Gender dysphoria')[]
  //   | undefined
  deliveryMethodPreference?: 'virtual' | 'in-person' | undefined
  locationStatePreference?: 'CO' | 'NY' | 'TX' | 'VA' | 'MD' | 'DC' | undefined
}
