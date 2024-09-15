import {
  type GetProvidersResponseType,
  type GetAvailabilitiesResponseType,
  type GetProvidersInputType,
  type GetAvailabilitiesInputType,
  type BookAppointmentInputType,
  type BookAppointmentResponseType,
  GetAvailabilitiesResponseSchema,
  GetProvidersResponseSchema,
} from '@awell-health/sol-scheduling'
import { log } from '../../../../../utils/logging'

export const fetchProviders = async (
  input: GetProvidersInputType
): Promise<GetProvidersResponseType> => {
  const basicMessage = 'Fetching sol providers'
  try {
    log({ message: basicMessage, data: input }, 'INFO', '')
    const response = await fetch('/api/sol/providers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      log(
        {
          message: `${basicMessage}: failed`,
          data: { input, response },
        },
        'ERROR',
        ''
      )
      throw new Error('Failed to fetch providers')
    }

    const jsonRes = await response.json()
    const result = GetProvidersResponseSchema.safeParse(jsonRes)

    if (!result.success) {
      log(
        {
          message: `${basicMessage}: zod parsing error`,
          data: { input, response, result },
        },
        'ERROR',
        ''
      )
      throw new Error('Zod error', result.error)
    }
    log(
      {
        message: `${basicMessage}: successfull`,
        data: { input, result },
      },
      'INFO',
      ''
    )
    return result.data
  } catch (error) {
    const errMessage = (error as any)?.message ?? `Unknown error: ${error}`
    log(
      {
        message: `${basicMessage}: error`,
        data: { input, error },
      },
      'ERROR',
      errMessage
    )
    throw error
  }
}

export const fetchAvailability = async (
  input: GetAvailabilitiesInputType
): Promise<GetAvailabilitiesResponseType> => {
  const basicMessage = 'Fetching provider availability'

  try {
    log({ message: basicMessage, data: input }, 'INFO', '')
    const response = await fetch(
      `/api/sol/providers/${input.providerId[0]}/availability`
    )

    if (!response.ok) {
      log(
        {
          message: `${basicMessage}: failed`,
          data: { input, response },
        },
        'ERROR',
        ''
      )
      throw new Error(
        `Failed to fetch availability for provider ${input.providerId[0]}`
      )
    }

    const jsonRes = await response.json()
    const result = GetAvailabilitiesResponseSchema.safeParse(jsonRes)

    if (!result.success) {
      log(
        {
          message: `${basicMessage}: failed with zod error`,
          data: { input, result },
        },
        'ERROR',
        ''
      )
      throw new Error('Zod error', result.error)
    }

    log(
      { message: `${basicMessage}: success`, data: { input, result } },
      'INFO',
      ''
    )
    return result.data
  } catch (error) {
    const errMessage = (error as any)?.message ?? `Unknown error: ${error}`
    log(
      { message: `${basicMessage}: error`, data: { input, error } },
      'ERROR',
      errMessage
    )
    throw error
  }
}

export const bookAppointment = async (
  input: BookAppointmentInputType
): Promise<BookAppointmentResponseType> => {
  const basicMessage = 'Booking sol appointment'
  try {
    log({ message: basicMessage, data: input }, 'INFO', '')
    const response = await fetch(`/api/sol/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      log(
        { message: `${basicMessage}: failed`, data: { input, response } },
        'ERROR',
        'Failed to book appointment'
      )
      throw new Error(`Failed to book appointment`)
    }

    const jsonRes = (await response.json()) as BookAppointmentResponseType

    log({ message: basicMessage, data: { input, jsonRes } }, 'INFO', '')

    return jsonRes
  } catch (error) {
    const errMessage = (error as any)?.message ?? `Unknown error: ${error}`
    log(
      { message: `${basicMessage}: error`, data: { input, error } },
      'ERROR',
      errMessage
    )
    throw error
  }
}
