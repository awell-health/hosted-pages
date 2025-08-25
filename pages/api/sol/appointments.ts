import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../src/utils'
import {
  BookAppointmentInputSchema,
  BookAppointmentResponseType,
} from '@awell-health/sol-scheduling'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from './utils'
import { omit } from 'lodash'
import { log } from '../../../src/utils/logging'

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
    const settings = getSolEnvSettings({ headers: req.headers })
    const accessToken = await getAccessToken(omit(settings, 'baseUrl'))

    const bodyValidation = BookAppointmentInputSchema.safeParse(input)
    log(
      `${logMessage}: parsing body`,
      {
        requestBody: input,
        bodyValidation,
        context: logContext,
      },
      bodyValidation.success ? 'INFO' : 'ERROR'
    )

    if (!bodyValidation.success) {
      const { errors } = bodyValidation.error

      return res.status(400).json({
        error: { message: 'Invalid request', errors },
      })
    }
    const url = `${settings.baseUrl}${API_ROUTES[API_METHODS.BOOK_EVENT]}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyValidation.data),
    })

    if (!response.ok) {
      const responseBody = await response.json()
      log(
        `${logMessage}: failed`,
        {
          requestBody: input,
          validatedRequestBody: bodyValidation.data,
          responseBody,
          errorCode: response.status,
          responseText: response.statusText,
          url,
          performance: new Date().valueOf() - startTime,
          context: logContext,
        },
        'ERROR'
      )
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const jsonRes: BookAppointmentResponseType = await response.json()

    const salesforceLeadId = (bodyValidation.data.userInfo as any)
      ?.salesforceLeadId

    const magicLink = salesforceLeadId
      ? `${process.env.NEXT_PUBLIC_DOMAIN}/magic-link/${salesforceLeadId}`
      : undefined

    const enhancedResponse = {
      ...jsonRes,
      data: {
        ...(typeof jsonRes.data === 'object' && jsonRes.data !== null
          ? jsonRes.data
          : {}),
        salesforceLeadId,
        magicLink,
      },
    }

    log(
      `${logMessage}: success`,
      {
        requestBody: input,
        responseBody: enhancedResponse,
        url,
        performance: new Date().valueOf() - startTime,
        context: logContext,
      },
      'INFO'
    )
    return res.status(200).json(enhancedResponse)
  } catch (error) {
    const errMessage = 'Internal Server Error'
    log(
      `${logMessage}: failed - ${errMessage}`,
      {
        requestBody: input,
        error,
        context: logContext,
      },
      'ERROR'
    )
    return res.status(500).json({
      error: errMessage,
      errorCode: '500',
    })
  }
}
