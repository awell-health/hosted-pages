import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../../../src/utils'
import { type GetProviderResponseType } from '@awell-health/sol-scheduling'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from '../../utils'
import { omit } from 'lodash'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const { id } = req.query

    const settings = getSolEnvSettings({ headers: req.headers })
    const accessToken = await getAccessToken(omit(settings, 'baseUrl'))

    const response = await fetch(
      `${settings.baseUrl}${
        API_ROUTES[API_METHODS.GET_PROVIDER]
      }?providerId=${id}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const jsonRes: GetProviderResponseType = await response.json()
    return res.status(200).json(jsonRes)
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      errorCode: '500',
    })
  }
}
