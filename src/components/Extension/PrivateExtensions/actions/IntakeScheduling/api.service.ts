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

export const fetchProviders = async (
  input: GetProvidersInputType
): Promise<GetProvidersResponseType> => {
  try {
    const response = await fetch('/api/sol/providers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error('Failed to fetch providers')
    }

    const jsonRes = await response.json()
    const result = GetProvidersResponseSchema.safeParse(jsonRes)

    if (!result.success) {
      console.error('Zod parsing error', result.error.issues)
      throw new Error('Zod error', result.error)
    }

    /**
     * Logging it the console for during the bootcamp
     */
    console.log('[get providers] json response', jsonRes)
    console.log('[get providers] parsed response with zod ', result.data)

    return result.data
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

    const jsonRes = await response.json()
    const result = GetAvailabilitiesResponseSchema.safeParse(jsonRes)

    if (!result.success) {
      console.error('Zod parsing error', result.error.issues)
      throw new Error('Zod error', result.error)
    }

    /**
     * Logging it the console for during the bootcamp
     */
    console.log('[get availabilities] json response', jsonRes)
    console.log('[get availabilities] parsed response with zod ', result.data)

    return result.data
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
    console.log('[book appt] json response', jsonRes)

    return jsonRes
  } catch (error) {
    console.error(`Error booking the appointment`, error)
    throw error
  }
}
