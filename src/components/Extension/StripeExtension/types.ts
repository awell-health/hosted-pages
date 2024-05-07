export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export type StripeExtensionSettings = {
  mode: 'Test' | 'Live'
  testModePublishableKey: string
  liveModePublishableKey: string
  hostedPagesEnvironmentVariable: string
}

export enum ActionKey {
  EMBEDDED_CHECKOUT = 'embeddedCheckout',
}

export type EmbeddedCheckoutActionFields = {
  item: string
  mode: 'payment' | 'setup' | 'subscription'
}
