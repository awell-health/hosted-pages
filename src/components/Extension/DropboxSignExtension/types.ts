export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export type DropboxSignExtensionSettings = {
  apiKey: string
  clientId: string
  testMode: boolean
}

export enum ActionKey {
  EMBEDDED_SIGNING = 'embeddedSigning',
}

export type EmbeddedSigningFields = {
  signUrl: string
  expiresAt: string // ISO8601 string
}
