import type { NextApiRequest, NextApiResponse } from 'next'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from '../../utils'
import { logger, LogEvent } from '../../../../../src/utils/logging'
import {
  fromV3ProviderResponse,
  type V3ProviderResponse,
} from '../../../../../src/services/sol/v3Adapter'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).end('Method Not Allowed')
  }
  const startTime = new Date().valueOf()
  const logMessage = 'SOL: Getting provider'

  const { id, session, pathway } = req.query

  try {
    const settings = getSolEnvSettings()

    const url = `${settings.baseUrl}${
      API_ROUTES[API_METHODS.GET_PROVIDER]
    }/${encodeURIComponent(String(id))}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const responseBody = await response.json()
      logger.error(`${logMessage}: failed`, LogEvent.SOL_API_REQUEST, {
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
      })
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const v3Res: V3ProviderResponse = await response.json()
    const jsonRes = fromV3ProviderResponse(v3Res)
    logger.info(`${logMessage}: success`, LogEvent.SOL_API_REQUEST, {
      queryParams: req.query,
      responseBody: v3Res,
      url,
      performance: new Date().valueOf() - startTime,
      context: {
        session: {
          id: session,
          pathway_id: pathway,
        },
      },
    })
    return res.status(200).json(jsonRes)
  } catch (error) {
    const errMessage = 'Internal Server Error'
    logger.error(
      `${logMessage}: failed - ${errMessage}`,
      LogEvent.SOL_API_REQUEST,
      {
        queryParams: req.query,
        providerId: req.query,
        error,
      }
    )
    return res.status(500).json({
      error: errMessage,
      errorCode: '500',
    })
  }
}
