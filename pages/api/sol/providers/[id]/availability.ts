import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../../../src/utils'
import { type GetAvailabilitiesResponseType } from '@awell-health/sol-scheduling'
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

  try {
    const { id } = req.query

    const settings = getSolEnvSettings({ headers: req.headers })
    const accessToken = await getAccessToken(omit(settings, 'baseUrl'))

    const response = await fetch(
      `${settings.baseUrl}${API_ROUTES[API_METHODS.GET_AVAILABILITY]}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providerId: [id],
        }),
      }
    )

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const jsonRes: GetAvailabilitiesResponseType | { data: string } =
      await response.json()
    if (jsonRes.data === '') {
      return res.status(404).json({ data: [] })
    }
    return res.status(200).json(jsonRes)
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      errorCode: '500',
    })
  }
}
