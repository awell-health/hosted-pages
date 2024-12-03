import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../auth'
import { isEmpty } from 'lodash'
import { log } from '../../../../../../src/utils/logging'
import { getWpEnvSettings, API_METHODS, API_ROUTES } from '../../../settings'
import { ProvidersResponse } from '../../../../../../src/components/Extension/PrivateExtensions/WP/RequestingProviderLookUp/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }

  const logMessage = 'WP: Get requesting providers'
  const { siteId, session, pathway, tenant } = req.query

  const settings = getWpEnvSettings()
  const url = `${settings.WP_P360_BASE_URL}${
    API_ROUTES[API_METHODS.GET_REQUESTING_PROVIDERS]
  }/${siteId?.toString()}`

  try {
    const accessToken = await getAccessToken({ settings })

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'wp-partner-key': settings.WP_P360_PARTNER_KEY,
      },
    })

    if (!response.ok) {
      const responseBody = await response.json()
      log(
        {
          message: `${logMessage}: failed`,
          requestUrl: url,
          responseBody,
          errorCode: response.status,
          responseText: response.statusText,
          context: {
            session: {
              id: session,
              pathway_id: pathway,
            },
            tenant,
          },
        },
        'ERROR'
      )
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const jsonRes: ProvidersResponse = await response.json()

    if (isEmpty(jsonRes.data)) {
      log(
        {
          message: `${logMessage}: failed - no data returned`,
          requestUrl: url,
          responseBody: jsonRes,
          responseText: response.statusText,
          errorCode: response.status,
          context: {
            session: {
              id: session,
              pathway_id: pathway,
            },
            tenant,
          },
        },
        'WARNING'
      )
      return res.status(404).json({ data: [] })
    }
    log({
      message: `${logMessage}: success`,
      requestUrl: url,
      responseBody: jsonRes,
      context: {
        session: {
          id: session,
          pathway_id: pathway,
        },
        tenant,
      },
    })
    return res.status(200).json(jsonRes)
  } catch (error) {
    const errMessage = 'Internal Server Error'
    log(
      {
        message: `${logMessage}: failed - ${errMessage}`,
        requestUrl: url,
        error,
        context: {
          session: {
            id: session,
            pathway_id: pathway,
          },
          tenant,
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
