import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../../src/utils'
import {
  GetProvidersInputSchema,
  GetProvidersResponseType,
} from '@awell-health/sol-scheduling'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from '../utils'
import { omit } from 'lodash'
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
  try {
    const settings = getSolEnvSettings({ headers: req.headers })
    const accessToken = await getAccessToken(omit(settings, 'baseUrl'))

    const bodyValidation = GetProvidersInputSchema.safeParse(req.body)
    log(
      {
        message: `${logMessage}: parsing body`,
        bodyValidation,
        body: req.body,
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
        {
          message: `${logMessage}: failed`,
          responseBody,
          validatedRequestBody: bodyValidation.data,
          requestBody: req.body,
          errorCode: response.status,
          responseText: response.statusText,
          url,
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

    const jsonRes: GetProvidersResponseType | { data: string } =
      await response.json()
    if (jsonRes.data === '') {
      log(
        {
          message: `${logMessage}: failed - no data returned`,
          responseBody: jsonRes,
          errorCode: response.status,
          responseText: response.statusText,
          url,
        },
        'ERROR'
      )
      return res.status(404).json({ data: [] })
    }
    log({
      message: `${logMessage}: success`,
      responseBody: jsonRes,
      url,
    })
    return res.status(200).json(jsonRes)
  } catch (error) {
    const errMessage = 'Internal Server Error'
    log(
      {
        message: `${logMessage}: failed - ${errMessage}`,
        error,
        body: req.body,
      },
      'ERROR'
    )
    return res.status(500).json({
      error: errMessage,
      errorCode: '500',
    })
  }
}
