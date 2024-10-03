import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../../src/utils'
import {
  GetProvidersInputSchema,
  GetProvidersResponseType,
} from '@awell-health/sol-scheduling'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from '../utils'
import { omit } from 'lodash'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const settings = getSolEnvSettings({ headers: req.headers })
    const accessToken = await getAccessToken(omit(settings, 'baseUrl'))

    const bodyValidation = GetProvidersInputSchema.safeParse(req.body)

    if (!bodyValidation.success) {
      const { errors } = bodyValidation.error

      return res.status(400).json({
        error: { message: 'Invalid request', errors },
      })
    }

    const response = await fetch(
      `${settings.baseUrl}${API_ROUTES[API_METHODS.GET_PROVIDERS]}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyValidation.data),
      }
    )

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        data: `${JSON.stringify(response)}`,
        accessToken,
        errorCode: String(response.status),
      })
    }

    const jsonRes: GetProvidersResponseType = await response.json()
    return res.status(200).json(jsonRes)
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      errorCode: '500',
    })
  }
}
