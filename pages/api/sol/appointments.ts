import type { NextApiRequest, NextApiResponse } from 'next'
import { getAccessToken } from '../../../src/utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  try {
    const accessToken = await getAccessToken({
      authUrl: process.env.SOL_AUTH_URL ?? '',
      clientId: process.env.SOL_CLIENT_ID ?? '',
      clientSecret: process.env.SOL_CLIENT_SECRET ?? '',
      resource: process.env.SOL_RESOURCE ?? '',
    })

    const response = await fetch(process.env.SOL_BOOKING_ENDPOINT ?? '', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify(req.body),
      body: JSON.stringify({
        eventId: 'event_2',
        userInfo: {
          userName: 'Nick Hellemans',
          userEmail: 'nick@awellhealth.com',
        },
      }),
    })

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: `Request failed with status ${response.status}`,
        errorCode: String(response.status),
      })
    }

    const jsonRes = await response.json()
    return res.status(200).json({ success: true, data: jsonRes })
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      errorCode: '500',
    })
  }
}
