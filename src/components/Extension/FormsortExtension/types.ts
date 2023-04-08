export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export enum ActionKey {
  COMPLETE_FLOW = 'completeFlow',
}

export type CompleteFlowFields = {
  clientLabel: string
  flowLabel: string
  variantLabel?: string
}
