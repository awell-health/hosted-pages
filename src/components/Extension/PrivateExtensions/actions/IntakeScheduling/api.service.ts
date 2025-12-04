import {
  type BookAppointmentInputType,
  type BookAppointmentResponseType,
  type GetAvailabilitiesInputType,
  type GetAvailabilitiesResponseType,
  type GetProviderInputType,
  type GetProviderResponseType,
  type GetProvidersInputType,
  type GetProvidersResponseType,
  GetAvailabilitiesResponseSchema,
  GetProviderResponseSchema,
  GetProvidersResponseSchema,
} from '@awell-health/sol-scheduling'
import type { HostedSession } from '../../../../../hooks/useHostedSession/types'
import { type SessionMetadata } from '../../../../../types/generated/types-orchestration'
import { LogEvent, logger } from '../../../../../utils/logging'
import { SolApiResponseError } from './helpers/error'

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
  const timeStart = new Date().valueOf()
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
  } finally {
    const timeEnd = new Date().valueOf()
    logger.info(
      `SOL: Fetch Providers: ${timeEnd - timeStart} milliseconds`,
      LogEvent.SOL_API_REQUEST,
      {
        time: timeEnd - timeStart,
        api: 'fetchProviders',
      }
    )
  }
}

export const fetchProvider = async ({
  input,
  requestOptions,
}: {
  input: GetProviderInputType
  requestOptions: RequestOptions
}): Promise<GetProviderResponseType> => {
  const timeStart = new Date().valueOf()
  try {
    const response = await fetch(
      `/api/sol/providers/${input.providerId}?session=${requestOptions.logContext?.session?.id}&pathway=${requestOptions.logContext?.session?.pathway_id}`,
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
  } finally {
    const timeEnd = new Date().valueOf()
    logger.info(
      `SOL: Fetch Provider: ${timeEnd - timeStart} milliseconds`,
      LogEvent.SOL_API_REQUEST,
      {
        time: timeEnd - timeStart,
        api: 'fetchProvider',
      }
    )
  }
}

export const fetchAvailability = async ({
  input,
  requestOptions,
}: {
  input: GetAvailabilitiesInputType
  requestOptions: RequestOptions
}): Promise<GetAvailabilitiesResponseType> => {
  const timeStart = new Date().valueOf()
  try {
    const response = await fetch(
      `/api/sol/providers/${input.providerId[0]}/availability?session=${requestOptions.logContext?.session?.id}&pathway=${requestOptions.logContext?.session?.pathway_id}`,
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
  } finally {
    const timeEnd = new Date().valueOf()
    logger.info(
      `SOL: Fetch Availability: ${timeEnd - timeStart} milliseconds`,
      LogEvent.SOL_API_REQUEST,
      {
        time: timeEnd - timeStart,
        api: 'fetchAvailability',
      }
    )
  }
}
export const bookAppointment = async ({
  input,
  requestOptions,
}: {
  input: BookAppointmentInputType
  requestOptions: RequestOptions
}): Promise<BookAppointmentResponseType> => {
  const timeStart = new Date().valueOf()
  try {
    logger.info(`SOL: Book Appointment request`, LogEvent.SOL_API_REQUEST, {
      body: input,
      requestOptions,
      api: 'bookAppointment',
    })
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
  } finally {
    const timeEnd = new Date().valueOf()
    logger.info(
      `SOL: Book Appointment: ${timeEnd - timeStart} milliseconds`,
      LogEvent.SOL_API_REQUEST,
      {
        time: timeEnd - timeStart,
        api: 'bookAppointment',
      }
    )
  }
}
