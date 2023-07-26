export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export enum ActionKey {
  EMBEDDED_SIGNING = 'embeddedSigning',
}

export type EmbeddedSigningFields = {
  signUrl: string
}
