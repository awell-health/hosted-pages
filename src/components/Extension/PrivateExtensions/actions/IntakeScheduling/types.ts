export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../../../hooks/useCompleteExtensionActivity'

export type ActionFields = {
  providerId?: string
  patientName: string
  agePreference?: number
  genderPreference?: 'M' | 'F' | 'Non-binary/non-conforming'
  ethnicityPreference?:
    | 'Asian'
    | 'Black or African American'
    | 'Hispanic or Latinx'
    | 'White'
    | 'Other'
  therapeuticModalityPreference?: 'Psychiatric' | 'Therapy'
  clinicalFocusPreference?: string // we receive it as a string although it's an array of strings
  // clinicalFocusPreference?:
  //   | ('ADHD' | 'Anxiety d/o' | 'Autism spectrum' | 'Gender dysphoria')[]
  //   | undefined
  deliveryMethodPreference?: 'virtual' | 'in-person'
  locationStatePreference?:
    | 'AL'
    | 'CO'
    | 'CT'
    | 'DC'
    | 'FL'
    | 'KS'
    | 'MD'
    | 'ME'
    | 'MN'
    | 'NC'
    | 'NJ'
    | 'NM'
    | 'NV'
    | 'NY'
    | 'PA'
    | 'TX'
    | 'VA'
    | 'WY'
}
