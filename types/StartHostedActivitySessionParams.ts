import { TrackingInput } from '../src/utils/extractTrackingParams'

export type StartHostedActivitySessionParams = {
  hostedPagesLinkId: string
  track_id?: string
  activity_id?: string
  tracking?: TrackingInput
}
