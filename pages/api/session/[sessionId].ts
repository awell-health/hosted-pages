// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'

type Data = {
  token: string
  status: string
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { sessionId } = req.query

  const token = jwt.sign(
    {
      session_id: sessionId,
      username: process.env.HOSTED_PAGES_CONSUMER_NAME,
    },
    process.env.HOSTED_PAGES_AUTH_SECRET as string,
    {
      issuer: process.env.HOSTED_PAGES_AUTH_KEY,
      subject: sessionId as string,
    }
  )

  res.status(200).json({ token, status: 'active' })
}
