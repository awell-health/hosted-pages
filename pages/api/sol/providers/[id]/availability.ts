import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../../../src/utils'
import { type GetAvailabilitiesResponseType } from '@awell-health/sol-scheduling'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from '../../utils'
import { omit, isEmpty } from 'lodash'
import { log } from '../../../../../src/utils/logging'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }
  const startTime = new Date().valueOf()
  const logMessage = 'SOL: Getting availability'
  const { id, session, pathway } = req.query

  try {
    const settings = getSolEnvSettings({ headers: req.headers })
    const accessToken = await getAccessToken(omit(settings, 'baseUrl'))

    const url = `${settings.baseUrl}${API_ROUTES[API_METHODS.GET_AVAILABILITY]}`

    const requestBody = {
      providerId: [id],
    }
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
        `${logMessage}: failed`,
        {
          queryParams: req.query,
          responseBody,
          errorCode: response.status,
          responseText: response.statusText,
          url,
          performance: new Date().valueOf() - startTime,
          context: {
            session: {
              id: session,
              pathway_id: pathway,
            },
          },
        },
        'ERROR'
      )
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const jsonRes: GetAvailabilitiesResponseType = await response.json()

    if (isEmpty(jsonRes.data?.[id as string])) {
      log(
        `${logMessage}: failed - no data returned`,
        {
          queryParams: req.query,
          requestBody,
          responseBody: jsonRes,
          responseText: response.statusText,
          errorCode: response.status,
          url,
          performance: new Date().valueOf() - startTime,
          context: {
            session: {
              id: session,
              pathway_id: pathway,
            },
          },
        },
        'WARNING'
      )
      return res.status(404).json({ data: [] })
    }
    log(
      `${logMessage}: success`,
      {
        queryParams: req.query,
        responseBody: jsonRes,
        url,
        performance: new Date().valueOf() - startTime,
        context: {
          session: {
            id: session,
            pathway_id: pathway,
          },
        },
      },
      'INFO'
    )
    return res.status(200).json(jsonRes)
  } catch (error) {
    const errMessage = 'Internal Server Error'
    log(
      `${logMessage}: failed - ${errMessage}`,
      {
        error,
        queryParams: req.query,
        context: {
          session: {
            id: session,
            pathway_id: pathway,
          },
        },
      },
      'ERROR'
    )
    return res.status(500).json({
      error: errMessage,
      errorCode: '500',
    })
  }
}
