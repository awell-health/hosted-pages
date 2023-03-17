import { ComponentProps } from 'react'
import { CalDotComScheduling } from '@awell_health/ui-library'
export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export enum ActionKey {
  BOOK_APPOINTMENT = 'bookAppointment',
}

export type BookAppointmentFields = {
  calLink: string
}

export type BookingSuccessfulFunction = ComponentProps<
  typeof CalDotComScheduling
>['onBookingSuccessful']

export type BookingSuccessfulFunctionArg =
  Parameters<BookingSuccessfulFunction>[0]
