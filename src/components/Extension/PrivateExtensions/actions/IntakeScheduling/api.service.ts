import type {
  GetProvidersResponseType,
  GetAvailabilitiesResponseType,
  GetProvidersInputType,
  GetAvailabilitiesInputType,
  BookAppointmentInputType,
  BookAppointmentResponseType,
} from '@awell-health/sol-scheduling'
import { rest } from 'lodash'

export const fetchProviders = async (
  input: GetProvidersInputType
): Promise<GetProvidersResponseType> => {
  const { location, ...rest } = input
  console.log('removing location from api request', { location })
  console.log('sending request with input', { rest })
  try {
    const response = await fetch('/api/sol/providers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rest),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch providers')
    }

    const jsonRes = (await response.json()) as GetProvidersResponseType

    /**
     * Logging it the console for during the bootcamp
     */
    console.log('[fetch providers] response', response)
    console.log('[fetch providers] json response', jsonRes)

    return jsonRes
  } catch (error) {
    console.error('Error fetching providers:', error)
    throw error
  }
}

export const fetchAvailability = async (
  input: GetAvailabilitiesInputType
): Promise<GetAvailabilitiesResponseType> => {
  try {
    const response = await fetch(
      `/api/sol/providers/${input.providerId[0]}/availability`
    )

    if (!response.ok) {
      throw new Error(
        `Failed to fetch availability for provider ${input.providerId[0]}`
      )
    }

    const jsonRes = (await response.json()) as GetAvailabilitiesResponseType

    /**
     * Logging it the console for during the bootcamp
     */
    console.log('[fetch availability] response', response)
    console.log('[fetch availability] json response', jsonRes)

    return jsonRes
  } catch (error) {
    console.error(
      `Error fetching availability for provider ${input.providerId[0]}:`,
      error
    )
    throw error
  }
}

export const bookAppointment = async (
  input: BookAppointmentInputType
): Promise<BookAppointmentResponseType> => {
  try {
    const response = await fetch(`/api/sol/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      throw new Error(`Failed to book appointment`)
    }

    const jsonRes = (await response.json()) as BookAppointmentResponseType

    /**
     * Logging it the console for during the bootcamp
     */
    console.log('[book appt] response', response)
    console.log('[book appt] json response', jsonRes)

    return jsonRes
  } catch (error) {
    console.error(`Error booking the appointment`, error)
    throw error
  }
}
