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
import type { HostedSession } from '../../../../../hooks/useHostedSession/types'
import { type SessionMetadata } from '../../../../../types/generated/types-orchestration'
interface RequestOptions {
  baseUrl: string
  logContext?: {
    session?: HostedSession | null
    metadata?: SessionMetadata | null
  }
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
      body: JSON.stringify({ input, logContext: requestOptions?.logContext }),
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
    const response = await fetch(
      `/api/sol/providers/${input.providerId}?session_id=${requestOptions.logContext?.session?.id}&pathway_id=${requestOptions.logContext?.session?.pathway_id}`,
      {
        headers: {
          'x-sol-api-url': requestOptions.baseUrl,
        },
      }
    )

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
      `/api/sol/providers/${input.providerId[0]}/availability?session_id=${requestOptions.logContext?.session?.id}&pathway_id=${requestOptions.logContext?.session?.pathway_id}`,
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
      body: JSON.stringify({ input, logContext: requestOptions?.logContext }),
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
