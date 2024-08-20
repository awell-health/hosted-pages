export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../../../hooks/useCompleteExtensionActivity'

export type ActionFields = {
  patientName: string
  agePreference?: number | undefined
  genderPreference?: 'M' | 'F' | 'Non-binary/non-conforming' | undefined
  ethnicityPreference?:
    | 'Asian'
    | 'Black or African American'
    | 'Hispanic or Latinx'
    | 'White'
    | 'Other'
    | undefined
  therapeuticModalityPreference?: 'Psychiatric' | 'Therapy' | undefined
  clinicalFocusPreference?: string | undefined // we receive it as a string although it's an array of strings
  // clinicalFocusPreference?:
  //   | ('ADHD' | 'Anxiety d/o' | 'Autism spectrum' | 'Gender dysphoria')[]
  //   | undefined
  deliveryMethodPreference?: 'virtual' | 'in-person' | undefined
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
    | undefined
}
