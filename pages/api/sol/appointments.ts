import type { NextApiRequest, NextApiResponse } from 'next'
import { BookAppointmentInputSchema } from '@awell-health/sol-scheduling'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from './utils'
import { logger, LogEvent } from '../../../src/utils/logging'
import {
  fromV3BookingResponse,
  toV3BookingBody,
  type V3BookingResponse,
} from '../../../src/services/sol/v3Adapter'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }
  const startTime = new Date().valueOf()
  const logMessage = 'SOL: Booking appointment'
  const { input, logContext } = req.body

  try {
    const settings = getSolEnvSettings()

    const bodyValidation = BookAppointmentInputSchema.safeParse(input)
    if (bodyValidation.success) {
      logger.info(`${logMessage}: parsing body`, LogEvent.SOL_API_REQUEST, {
        requestBody: input,
        bodyValidation,
        context: logContext,
      })
    } else {
      logger.error(`${logMessage}: parsing body`, LogEvent.SOL_API_REQUEST, {
        requestBody: input,
        bodyValidation,
        context: logContext,
      })
    }

    if (!bodyValidation.success) {
      const { errors } = bodyValidation.error

      return res.status(400).json({
        error: { message: 'Invalid request', errors },
      })
    }
    const url = `${settings.baseUrl}${API_ROUTES[API_METHODS.BOOK_EVENT]}`
    const v3Body = toV3BookingBody(bodyValidation.data)
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(v3Body),
    })

    // v3 answers 201 on success; any 2xx is treated as booked
    if (!response.ok) {
      const responseBody = await response.json()
      logger.error(`${logMessage}: failed`, LogEvent.SOL_API_REQUEST, {
        requestBody: input,
        validatedRequestBody: v3Body,
        responseBody,
        errorCode: response.status,
        responseText: response.statusText,
        url,
        performance: new Date().valueOf() - startTime,
        context: logContext,
      })
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const v3Res: V3BookingResponse = await response.json()
    const jsonRes = fromV3BookingResponse(v3Res)

    logger.info(`${logMessage}: success`, LogEvent.SOL_API_REQUEST, {
      requestBody: input,
      responseBody: v3Res,
      url,
      performance: new Date().valueOf() - startTime,
      context: logContext,
    })
    return res.status(200).json(jsonRes)
  } catch (error) {
    const errMessage = 'Internal Server Error'
    logger.error(
      `${logMessage}: failed - ${errMessage}`,
      LogEvent.SOL_API_REQUEST,
      {
        requestBody: input,
        error,
        context: logContext,
      }
    )
    return res.status(500).json({
      error: errMessage,
      errorCode: '500',
    })
  }
}
