import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../../../src/utils'
import { type GetProviderResponseType } from '@awell-health/sol-scheduling'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from '../../utils'
import { omit } from 'lodash'
import { log } from '../../../../../src/utils/logging'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }
  const logMessage = 'SOL: Getting provider'
  try {
    const { id } = req.query

    const settings = getSolEnvSettings({ headers: req.headers })
    const accessToken = await getAccessToken(omit(settings, 'baseUrl'))

    const url = `${settings.baseUrl}${
      API_ROUTES[API_METHODS.GET_PROVIDER]
    }?providerId=${id}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const responseBody = await response.json()
      log(
        {
          message: `${logMessage}: failed`,
          responseBody,
          errorCode: response.status,
          responseText: response.statusText,
          url,
        },
        'ERROR'
      )
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const jsonRes: GetProviderResponseType = await response.json()
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
        providerId: req.query,
      },
      'ERROR'
    )
    return res.status(500).json({
      error: errMessage,
      errorCode: '500',
    })
  }
}
