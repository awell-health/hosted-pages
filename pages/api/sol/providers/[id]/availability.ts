import type { NextApiRequest, NextApiResponse } from 'next'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from '../../utils'
import { isEmpty } from 'lodash'
import { logger, LogEvent } from '../../../../../src/utils/logging'
import {
  fromV3AvailabilityResponse,
  toV3AvailabilityQuery,
  type V3AvailabilityResponse,
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
  const logMessage = 'SOL: Getting availability'
  const { id, session, pathway } = req.query

  try {
    const settings = getSolEnvSettings()

    const providerId = String(id)
    const url = `${settings.baseUrl}${
      API_ROUTES[API_METHODS.GET_AVAILABILITY]
    }?${toV3AvailabilityQuery([providerId])}`

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

    const v3Res: V3AvailabilityResponse = await response.json()
    const jsonRes = fromV3AvailabilityResponse(v3Res)

    if (isEmpty(jsonRes.data?.[providerId])) {
      logger.warn(
        `${logMessage}: failed - no data returned`,
        LogEvent.SOL_API_REQUEST,
        {
          queryParams: req.query,
          responseBody: v3Res,
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
        }
      )
      return res.status(404).json({ data: [] })
    }
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
        error,
        queryParams: req.query,
        context: {
          session: {
            id: session,
            pathway_id: pathway,
          },
        },
      }
    )
    return res.status(500).json({
      error: errMessage,
      errorCode: '500',
    })
  }
}
