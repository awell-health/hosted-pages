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
import { SolApiResponseError } from './helpers/error'
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
      const errorMessage = `Failed to fetch providers: ${response.statusText}`
      log(
        {
          message: `${basicMessage}: ${errorMessage}`,
          data: { input, response },
        },
        'ERROR',
        ''
      )
      throw new SolApiResponseError(errorMessage)
    }

    const jsonRes = await response.json()
    const result = GetProvidersResponseSchema.safeParse(jsonRes)

    if (!result.success) {
      const errorMessage = 'SOL API response does not match expected schema'
      log(
        {
          message: `${basicMessage}: ${errorMessage}`,
          data: { input, response, result },
        },
        'ERROR',
        ''
      )
      throw new SolApiResponseError(errorMessage, result.error.issues)
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
      const errorMessage = `Failed to fetch availability for provider ${input.providerId[0]}: ${response.statusText}`
      log(
        {
          message: `${basicMessage}: ${errorMessage}`,
          data: { input, response },
        },
        'ERROR',
        ''
      )
      throw new SolApiResponseError(errorMessage)
    }

    const jsonRes = await response.json()
    const result = GetAvailabilitiesResponseSchema.safeParse(jsonRes)

    if (!result.success) {
      const errorMessage = 'SOL API response does not match expected schema'
      log(
        {
          message: `${basicMessage}: ${errorMessage}`,
          data: { input, result },
        },
        'ERROR',
        ''
      )
      throw new SolApiResponseError(errorMessage, result.error.issues)
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
      const errorMessage = `Failed to book appointment: ${response.statusText}`
      log(
        { message: `${basicMessage}: failed`, data: { input, response } },
        'ERROR',
        errorMessage
      )
      throw new SolApiResponseError(errorMessage)
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
