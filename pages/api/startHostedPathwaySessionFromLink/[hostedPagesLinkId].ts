// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { environment } from '../../../types'

export type StartHostedCareflowSessionParams = {
  hostedPagesLinkId: string
}

export type StartHostedCareflowSessionPayload = {
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
  const { hostedPagesLinkId } = req.query as StartHostedCareflowSessionParams

  const token = jwt.sign(
    {
      username: environment.apiGatewayConsumerName,
      feature: 'hosted-pathway-link',
    },
    environment.jwtAuthSecret,
    {
      issuer: environment.jwtAuthKey,
      subject: hostedPagesLinkId,
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
          mutation StartHostedPathwaySessionFromLink($input: StartHostedPathwaySessionFromLinkInput!) {
            startHostedPathwaySessionFromLink(input: $input) {
              session_url
            }
          }
        `,
        variables: {
          input: {
            id: hostedPagesLinkId,
          },
        },
      }),
    })
    const session_response = await response.json()

    const { session_url } =
      session_response?.data?.startHostedPathwaySessionFromLink

    res.status(200).json({ sessionUrl: session_url })
  } catch (error) {
    console.log(error)
    res.status(500).json({ error })
  }
}
