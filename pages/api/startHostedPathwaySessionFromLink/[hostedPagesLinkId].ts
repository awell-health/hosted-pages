// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { environment } from '../../../types'
import { isNil } from 'lodash'

export type StartHostedCareflowSessionParams = {
  hostedPagesLinkId: string
}

export type StartHostedCareflowSessionPayload = {
  sessionUrl: string
  error?: string
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
  const { data, errors } = await response.json()
  if (!isNil(errors) && errors.length > 0) {
    res.status(200).json({ error: errors[0].extensions?.data.message })
  }

  const sessionUrl = data?.startHostedPathwaySessionFromLink.session_url
  res.status(200).json({ sessionUrl })
}
