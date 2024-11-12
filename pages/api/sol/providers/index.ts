import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../../src/utils'
import {
  GetProvidersInputSchema,
  GetProvidersResponseType,
} from '@awell-health/sol-scheduling'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from '../utils'
import { omit, isEmpty } from 'lodash'
import { log } from '../../../../src/utils/logging'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }
  const logMessage = 'SOL: Getting providers'
  const { input, logContext } = req.body

  try {
    const settings = getSolEnvSettings({ headers: req.headers })
    const accessToken = await getAccessToken(omit(settings, 'baseUrl'))

    const bodyValidation = GetProvidersInputSchema.safeParse(input)
    log(
      {
        message: `${logMessage}: parsing body`,
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
    const url = `${settings.baseUrl}${API_ROUTES[API_METHODS.GET_PROVIDERS]}`
    const requestBody = bodyValidation.data
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })
    if (!response.ok) {
      const responseBody = await response.json()
      log(
        {
          message: `${logMessage}: failed`,
          requestBody: input,
          validatedRequestBody: bodyValidation.data,
          responseText: response.statusText,
          responseBody,
          errorCode: response.status,
          url,
          context: logContext,
        },
        'ERROR'
      )
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        data: `${JSON.stringify(response)}`,
        accessToken,
        errorCode: String(response.status),
      })
    }

    const jsonRes: GetProvidersResponseType = await response.json()

    if (isEmpty(jsonRes.data)) {
      log(
        {
          message: `${logMessage}: failed - no data returned`,
          requestBody,
          responseBody: jsonRes,
          responseText: response.statusText,
          errorCode: response.status,
          url,
          context: logContext,
        },
        'WARNING'
      )
      return res.status(404).json({ data: [] })
    }
    log({
      message: `${logMessage}: success`,
      requestBody: input,
      responseBody: jsonRes,
      url,
      context: logContext,
    })
    return res.status(200).json(jsonRes)
  } catch (error) {
    const errMessage = 'Internal Server Error'
    log(
      {
        message: `${logMessage}: failed - ${errMessage}`,
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
