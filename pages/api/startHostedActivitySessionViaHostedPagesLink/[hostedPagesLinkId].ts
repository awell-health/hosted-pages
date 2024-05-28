// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import {
  environment,
  StartHostedActivitySessionParams,
  StartHostedActivitySessionPayload,
} from '../../../types'
import { isNil } from 'lodash'

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
      feature: 'hosted-activities-link',
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
          mutation StartHostedActivitySessionViaHostedPagesLink($input: StartHostedActivitySessionViaHostedPagesLinkInput!) {
            startHostedActivitySessionViaHostedPagesLink(input: $input) {
              session_id
              session_url
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

  const { data, errors } = await response.json()
  if (!isNil(errors) && errors.length > 0) {
    res
      .status(200)
      .json({ error: errors[0].extensions?.data?.message ?? errors[0].message })
    return
  }

  const { session_id, session_url } =
    data?.startHostedActivitySessionViaHostedPagesLink

  res.status(200).json({ sessionId: session_id, sessionUrl: session_url })
}
