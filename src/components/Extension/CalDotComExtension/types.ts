import { ComponentProps } from 'react'
import { CalDotComScheduling } from '@awell_health/ui-library'

export enum ActionKey {
  BOOK_APPOINTMENT = 'bookAppointment',
}

export type BookAppointmentFields = {
  calLink: string
}

export type BookingSuccessfulFunction = ComponentProps<
  typeof CalDotComScheduling
>['onBookingSuccessful']
