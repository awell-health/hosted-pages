// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

type Data = {
  session_id: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { stakeholderId, pathwayId } = req.query

  const token = jwt.sign(
    {
      username: process.env.HOSTED_PAGES_CONSUMER_NAME,
      stakeholder_id: stakeholderId,
      pathway_id: pathwayId,
    },
    process.env.HOSTED_PAGES_AUTH_SECRET as string,
    {
      issuer: process.env.HOSTED_PAGES_AUTH_KEY,
      subject: stakeholderId as string,
    }
  )

  const session = await fetch(
    process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API as string,
    {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation StartHostedActivitySession($input: StartHostedActivitySessionInput!) {
            startHostedActivitySession(input: $input) {
              session_id
            }
          }
          `,
        variables: {
          input: {
            stakeholder_id: stakeholderId,
            pathway_id: pathwayId,
          },
        },
      }),
    }
  )

  const session_response = await session.json()

  const { session_id } = session_response.data.startHostedActivitySession

  res.status(200).json({ session_id })
}
