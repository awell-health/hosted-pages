import type {
  GetProvidersResponseType,
  GetAvailabilitiesResponseType,
  GetProvidersInputType,
  GetAvailabilitiesInputType,
  BookAppointmentInputType,
  BookAppointmentResponseType,
} from '@awell-health/sol-scheduling'

export const fetchProviders = async (
  input: GetProvidersInputType
): Promise<GetProvidersResponseType> => {
  try {
    const response = await fetch('/api/sol/providers', {
      method: 'POST',
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      throw new Error('Failed to fetch providers')
    }

    const jsonRes = (await response.json()) as GetProvidersResponseType

    /**
     * Logging it the console for during the bootcamp
     */
    console.log('response', response)
    console.log('json response', jsonRes)

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
    console.log('response', response)
    console.log('json response', jsonRes)

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
      body: JSON.stringify(input),
    })
    if (!response.ok) {
      throw new Error(`Failed to book appointment`)
    }

    const jsonRes = (await response.json()) as BookAppointmentResponseType

    /**
     * Logging it the console for during the bootcamp
     */
    console.log('response', response)
    console.log('json response', jsonRes)

    return jsonRes
  } catch (error) {
    console.error(`Error booking the appointment`, error)
    throw error
  }
}
