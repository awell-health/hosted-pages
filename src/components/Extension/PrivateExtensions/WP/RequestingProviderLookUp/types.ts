export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../../../hooks/useCompleteExtensionActivity'

/**
 * No extension settings used as that would expose them in the front-end.
 * Instead, environment variables are used.
 **/
export type ExtensionSettings = {}

export type ActionFields = {
  siteId: string
  label: string
  required?: string // serialized boolean
}

export type Provider = {
  siteName: string
  provider: string
  reference: string
}

export type ProvidersResponse = {
  messageId: string
  messageDateTime: string
  vendorId: number
  vendorName: string
  organizationId: number
  resourceType: string
  resourceId: number
  data: Array<Provider>
}
