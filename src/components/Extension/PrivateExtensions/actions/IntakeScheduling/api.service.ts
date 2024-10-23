import {
  type GetProvidersResponseType,
  type GetAvailabilitiesResponseType,
  type GetProvidersInputType,
  type GetAvailabilitiesInputType,
  type BookAppointmentInputType,
  type BookAppointmentResponseType,
  type GetProviderInputType,
  type GetProviderResponseType,
  GetAvailabilitiesResponseSchema,
  GetProviderResponseSchema,
  GetProvidersResponseSchema,
} from '@awell-health/sol-scheduling'
import { SolApiResponseError } from './helpers/error'
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
  try {
    const response = await fetch('/api/sol/providers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-sol-api-url': requestOptions.baseUrl,
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new SolApiResponseError(
        `Failed to fetch providers: ${response.statusText}`
      )
    }

    const jsonRes = await response.json()
    const result = GetProvidersResponseSchema.safeParse(jsonRes)
    if (!result.success) {
      throw new SolApiResponseError(
        'SOL API response does not match expected schema',
        result.error.issues
      )
    }
    return result.data
  } catch (error) {
    throw error
  }
}

export const fetchProvider = async ({
  input,
  requestOptions,
}: {
  input: GetProviderInputType
  requestOptions: RequestOptions
}): Promise<GetProviderResponseType> => {
  try {
    const response = await fetch(`/api/sol/providers/${input.providerId}`, {
      headers: {
        'x-sol-api-url': requestOptions.baseUrl,
      },
    })

    if (!response.ok) {
      const errorMessage = `Failed to fetch availability for provider ${input.providerId}: ${response.statusText}`
      throw new SolApiResponseError(errorMessage)
    }

    const jsonRes = await response.json()
    const result = GetProviderResponseSchema.safeParse(jsonRes)
    if (!result.success) {
      const errorMessage = 'SOL API response does not match expected schema'
      throw new SolApiResponseError(errorMessage, result.error.issues)
    }
    return result.data
  } catch (error) {
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
  try {
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
      throw new SolApiResponseError(errorMessage)
    }

    const jsonRes = await response.json()
    const result = GetAvailabilitiesResponseSchema.safeParse(jsonRes)
    if (!result.success) {
      const errorMessage = 'SOL API response does not match expected schema'
      throw new SolApiResponseError(errorMessage, result.error.issues)
    }
    return result.data
  } catch (error) {
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
  try {
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
      throw new SolApiResponseError(errorMessage)
    }

    const jsonRes = (await response.json()) as BookAppointmentResponseType

    return jsonRes
  } catch (error) {
    throw error
  }
}
