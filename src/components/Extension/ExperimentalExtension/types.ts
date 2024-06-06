export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export enum ActionKey {
  REQUEST_VIDEO_VISIT = 'requestVideoVisit',
  REDIRECT = 'redirect',
}

export type RequestVideoVisitActionFields = {
  deepLink?: string
}
