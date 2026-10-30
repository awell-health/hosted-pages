import type { NextApiRequest, NextApiResponse } from 'next'
import { GetProvidersInputSchema } from '@awell-health/sol-scheduling'
import { getSolEnvSettings, API_ROUTES, API_METHODS } from '../utils'
import { isEmpty, isNil } from 'lodash'
import { logger, LogEvent } from '../../../../src/utils/logging'
import {
  fromV3ProviderSearchResponse,
  toV3ProviderSearchQuery,
  type V3ProviderSearchResponse,
} from '../../../../src/services/sol/v3Adapter'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }
  const startTime = new Date().valueOf()
  const logMessage = 'SOL: Getting providers'
  const { input, logContext } = req.body
  try {
    const settings = getSolEnvSettings()
    const modifiedInput = Object.fromEntries(
      Object.entries(input).filter(
        ([_, value]) => !isNil(value) && !isEmpty(value)
      )
    )
    const bodyValidation = GetProvidersInputSchema.safeParse(modifiedInput)
    if (bodyValidation.success) {
      logger.info(
        `${logMessage}: parsing body (removing nil and empty values)`,
        LogEvent.SOL_API_REQUEST,
        {
          requestBody: input,
          modifiedInput,
          bodyValidation,
          context: logContext,
        }
      )
    } else {
      logger.error(
        `${logMessage}: parsing body (removing nil and empty values)`,
        LogEvent.SOL_API_REQUEST,
        {
          requestBody: input,
          modifiedInput,
          bodyValidation,
          context: logContext,
        }
      )
    }
    if (!bodyValidation.success) {
      const { errors } = bodyValidation.error

      return res.status(400).json({
        error: { message: 'Invalid request', errors },
      })
    }
    const url = `${settings.baseUrl}${
      API_ROUTES[API_METHODS.GET_PROVIDERS]
    }?${toV3ProviderSearchQuery(bodyValidation.data)}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    })
    if (!response.ok) {
      const responseBody = await response.json()
      logger.error(`${logMessage}: failed`, LogEvent.SOL_API_REQUEST, {
        requestBody: input,
        validatedRequestBody: bodyValidation.data,
        responseText: response.statusText,
        responseBody,
        errorCode: response.status,
        url,
        performance: new Date().valueOf() - startTime,
        context: logContext,
      })
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        data: `${JSON.stringify(response)}`,
        errorCode: String(response.status),
      })
    }

    const v3Res: V3ProviderSearchResponse = await response.json()
    const jsonRes = fromV3ProviderSearchResponse(v3Res)

    if (isEmpty(jsonRes.data)) {
      logger.warn(
        `${logMessage}: failed - no data returned`,
        LogEvent.SOL_API_REQUEST,
        {
          requestBody: bodyValidation.data,
          responseBody: v3Res,
          responseText: response.statusText,
          errorCode: response.status,
          url,
          performance: new Date().valueOf() - startTime,
          context: logContext,
        }
      )
      return res.status(404).json({ data: [] })
    }
    logger.info(`${logMessage}: success`, LogEvent.SOL_API_REQUEST, {
      requestBody: bodyValidation.data,
      responseBody: v3Res,
      url,
      performance: new Date().valueOf() - startTime,
      context: logContext,
    })
    return res.status(200).json(jsonRes)
  } catch (error) {
    const errMessage = 'Internal Server Error'
    logger.error(
      `${logMessage}: failed - ${errMessage}`,
      LogEvent.SOL_API_REQUEST,
      {
        requestBody: input,
        error,
        context: logContext,
      }
    )
    return res.status(500).json({
      error: errMessage,
      errorCode: '500',
    })
  }
}
