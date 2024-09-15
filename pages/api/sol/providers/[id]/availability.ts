import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../../../src/utils'
import { type GetAvailabilitiesResponseType } from '@awell-health/sol-scheduling'

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

    if (
      !process.env.SOL_AUTH_URL ||
      !process.env.SOL_CLIENT_ID ||
      !process.env.SOL_CLIENT_SECRET ||
      !process.env.SOL_RESOURCE ||
      !process.env.SOL_AVAILABILITY_ENDPOINT
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

    const response = await fetch(process.env.SOL_AVAILABILITY_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        providerId: [id],
      }),
    })

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const jsonRes: GetAvailabilitiesResponseType = await response.json()
    return res.status(200).json(jsonRes)
  } catch (error) {
    return res.status(500).json({
      error: 'Internal Server Error',
      errorCode: '500',
    })
  }
}
