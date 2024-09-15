import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../../src/utils'
import {
  GetProvidersInputSchema,
  GetProvidersResponseType,
} from '@awell-health/sol-scheduling'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    if (
      !process.env.SOL_AUTH_URL ||
      !process.env.SOL_CLIENT_ID ||
      !process.env.SOL_CLIENT_SECRET ||
      !process.env.SOL_RESOURCE ||
      !process.env.SOL_PROVIDERS_ENDPOINT
    )
      throw new Error(
        'Missing environment variables for connection to the SOL API'
      )

    const accessToken = await getAccessToken({
      authUrl: process.env.SOL_AUTH_URL,
      clientId: process.env.SOL_CLIENT_ID,
      clientSecret: process.env.SOL_CLIENT_SECRET,
      resource: process.env.SOL_RESOURCE,
    })

    const bodyValidation = GetProvidersInputSchema.safeParse(req.body)

    if (!bodyValidation.success) {
      const { errors } = bodyValidation.error

      return res.status(400).json({
        error: { message: 'Invalid request', errors },
      })
    }

    const response = await fetch(process.env.SOL_PROVIDERS_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyValidation.data),
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
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
