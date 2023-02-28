// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { environment, StartHostedActivitySessionParams } from '../../../types'

type Data =
  | {
      sessionId: string
    }
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
      hosted_pages_link_id: hostedPagesLinkId,
    },
    environment.jwtAuthSecret,
    {
      issuer: environment.jwtAuthKey,
    }
  )
  try {
    const hosted_pages_link = await fetch(environment.orchestrationApiUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation StartActivitySessionUsingHostedPagesLink($input: StartActivitySessionUsingHostedPagesLinkInput!) {
            startActivitySessionUsingHostedPagesLink(input: $input) {
              session_id
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

    const link_response = await hosted_pages_link.json()

    const { session_id } =
      link_response?.data?.startActivitySessionUsingHostedPagesLink

    res.status(200).json({ sessionId: session_id })
  } catch (error) {
    res.status(500).json({ error })
  }
}
