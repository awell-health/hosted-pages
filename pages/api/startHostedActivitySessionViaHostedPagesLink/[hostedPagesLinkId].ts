// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import {
  environment,
  StartHostedActivitySessionParams,
  StartHostedActivitySessionPayload,
} from '../../../types'

type Data =
  | StartHostedActivitySessionPayload
  | {
      error: any
    }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { hostedPagesLinkId } = req.query as StartHostedActivitySessionParams

  const token = jwt.sign(
    {
      username: environment.apiGatewayConsumerName,
      feature: 'hosted-pages-link',
    },
    environment.jwtAuthSecret,
    {
      issuer: environment.jwtAuthKey,
      subject: hostedPagesLinkId,
    }
  )
  try {
    const session = await fetch(environment.orchestrationApiUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation StartHostedActivitySessionViaHostedPagesLink($input: StartHostedActivitySessionViaHostedPagesLinkInput!) {
            startHostedActivitySessionViaHostedPagesLink(input: $input) {
              session_id
              language
            }
          }
          `,
        variables: {
          input: {
            hosted_pages_link_id: hostedPagesLinkId,
          },
        },
      }),
    })

    const session_response = await session.json()

    const { session_id, language } =
      session_response?.data?.startHostedActivitySessionViaHostedPagesLink

    res.status(200).json({ sessionId: session_id, language })
  } catch (error) {
    res.status(500).json({ error })
  }
}
