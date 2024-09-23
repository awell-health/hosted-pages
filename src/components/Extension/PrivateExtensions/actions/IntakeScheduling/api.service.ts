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

// Helper function to log messages to the API route
const log = async (params: {}, severity: string, error: string | {} = '') => {
  try {
    await fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ params, severity, error }),
    })
  } catch (err) {
    console.error('Error sending log request:', err)
  }
}

interface RequestOptions {
  baseUrl: string
}

export const fetchProviders = async ({
  input,
  requestOptions,
}: {
  input: GetProvidersInputType
  requestOptions: RequestOptions
}): Promise<GetProvidersResponseType> => {
  const basicMessage = 'SOL: Fetching providers'
  try {
    log({ message: basicMessage, data: input }, 'INFO')
    const response = await fetch('/api/sol/providers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sol-api-url': requestOptions.baseUrl,
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
        errorMessage
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
        errorMessage
      )
      throw new SolApiResponseError(errorMessage, result.error.issues)
    }
    log(
      {
        message: `${basicMessage}: successfull`,
        data: { input, result },
      },
      'INFO'
    )
    return result.data
  } catch (error) {
    const errMessage = (error as any)?.message ?? `Unknown error: ${error}`
    log(
      {
        message: `${basicMessage}: ${errMessage}`,
        data: { input, error },
      },
      'ERROR',
      error as SolApiResponseError
    )
    throw error
  }
}

export const fetchAvailability = async ({
  input,
  requestOptions,
}: {
  input: GetAvailabilitiesInputType
  requestOptions: RequestOptions
}): Promise<GetAvailabilitiesResponseType> => {
  const basicMessage = 'SOL: Fetching provider availability'

  try {
    log({ message: basicMessage, data: input }, 'INFO')
    const response = await fetch(
      `/api/sol/providers/${input.providerId[0]}/availability`,
      {
        headers: {
          'x-sol-api-url': requestOptions.baseUrl,
        },
      }
    )

    if (!response.ok) {
      const errorMessage = `Failed to fetch availability for provider ${input.providerId[0]}: ${response.statusText}`
      log(
        {
          message: `${basicMessage}: ${errorMessage}`,
          data: { input, response },
        },
        'ERROR',
        errorMessage
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
        errorMessage
      )
      throw new SolApiResponseError(errorMessage, result.error.issues)
    }

    log(
      { message: `${basicMessage}: success`, data: { input, result } },
      'INFO'
    )
    return result.data
  } catch (error) {
    const errMessage = (error as any)?.message ?? `Unknown error: ${error}`
    log(
      { message: `${basicMessage}: ${errMessage}`, data: { input, error } },
      'ERROR',
      error as SolApiResponseError
    )
    throw error
  }
}

export const bookAppointment = async ({
  input,
  requestOptions,
}: {
  input: BookAppointmentInputType
  requestOptions: RequestOptions
}): Promise<BookAppointmentResponseType> => {
  const basicMessage = 'SOL: Booking appointment'
  try {
    log({ message: basicMessage, data: input }, 'INFO')
    const response = await fetch(`/api/sol/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sol-api-url': requestOptions.baseUrl,
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

    log({ message: basicMessage, data: { input, jsonRes } }, 'INFO')

    return jsonRes
  } catch (error) {
    const errMessage = (error as any)?.message ?? `Unknown error: ${error}`
    log(
      { message: `${basicMessage}: ${errMessage}`, data: { input, error } },
      'ERROR',
      error as SolApiResponseError
    )
    throw error
  }
}
