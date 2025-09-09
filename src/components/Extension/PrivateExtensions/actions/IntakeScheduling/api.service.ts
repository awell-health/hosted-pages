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
import { LogEvent, LogSeverity } from '../../../../../hooks/useLogging/types'

interface RequestOptions {
  baseUrl: string
  logContext?: {
    session?: HostedSession | null
    metadata?: SessionMetadata | null
  }
}

type LogRequest = (
  message: string,
  params: {},
  severity: LogSeverity,
  event: LogEvent
) => void

export const fetchProviders = async ({
  input,
  requestOptions,
  log,
}: {
  input: GetProvidersInputType
  requestOptions: RequestOptions
  log: LogRequest
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
    log(
      `SOL: Fetch Providers: ${timeEnd - timeStart} milliseconds`,
      {
        time: timeEnd - timeStart,
        api: 'fetchProviders',
      },
      'INFO',
      LogEvent.SOL_API_REQUEST
    )
  }
}

export const fetchProvider = async ({
  input,
  requestOptions,
  log,
}: {
  input: GetProviderInputType
  requestOptions: RequestOptions
  log: LogRequest
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
    log(
      `SOL: Fetch Provider: ${timeEnd - timeStart} milliseconds`,
      {
        time: timeEnd - timeStart,
        api: 'fetchProvider',
      },
      'INFO',
      LogEvent.SOL_API_REQUEST
    )
  }
}

export const fetchAvailability = async ({
  input,
  requestOptions,
  log,
}: {
  input: GetAvailabilitiesInputType
  requestOptions: RequestOptions
  log: LogRequest
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
    log(
      `SOL: Fetch Availability: ${timeEnd - timeStart} milliseconds`,
      {
        time: timeEnd - timeStart,
        api: 'fetchAvailability',
      },
      'INFO',
      LogEvent.SOL_API_REQUEST
    )
  }
}
export const bookAppointment = async ({
  input,
  requestOptions,
  log,
}: {
  input: BookAppointmentInputType
  requestOptions: RequestOptions
  log: LogRequest
}): Promise<BookAppointmentResponseType> => {
  const timeStart = new Date().valueOf()
  try {
    log(
      `SOL: Book Appointment request`,
      {
        body: input,
        requestOptions,
        api: 'bookAppointment',
      },
      'INFO',
      LogEvent.SOL_API_REQUEST
    )
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
    log(
      `SOL: Book Appointment: ${timeEnd - timeStart} milliseconds`,
      {
        time: timeEnd - timeStart,
        api: 'bookAppointment',
      },
      'INFO',
      LogEvent.SOL_API_REQUEST
    )
  }
}
