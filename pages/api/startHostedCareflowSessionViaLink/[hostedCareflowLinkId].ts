// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { environment } from '../../../types'

export type StartHostedCareflowSessionParams = {
  hostedCareflowLinkId: string
}

export type StartHostedCareflowSessionPayload = {
  sessionId: string
  sessionUrl: string
}

type Data =
  | StartHostedCareflowSessionPayload
  | {
      error: any
    }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { hostedCareflowLinkId } = req.query as StartHostedCareflowSessionParams

  const token = jwt.sign(
    {
      username: environment.apiGatewayConsumerName,
      feature: 'hosted-careflow-link',
    },
    environment.jwtAuthSecret,
    {
      issuer: environment.jwtAuthKey,
      subject: hostedCareflowLinkId,
    }
  )
  try {
    const response = await fetch(environment.orchestrationApiUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation StartHostedCareflowSessionViaLink($input: StartHostedCareflowSessionViaLinkInput!) {
            startHostedCareflowSessionViaLink(input: $input) {
              session_id
              session_url
            }
          }
          `,
        variables: {
          input: {
            hosted_careflow_link_id: hostedCareflowLinkId,
          },
        },
      }),
    })

    const session_response = await response.json()

    const { session_id, session_url } =
      session_response?.data?.startHostedCareflowSessionViaLink

    res.status(200).json({ sessionId: session_id, sessionUrl: session_url })
  } catch (error) {
    res.status(500).json({ error })
  }
}
