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
      sub: sessionId,
    },
    process.env.HOSTED_PAGES_AUTH_SECRET as string
  )

  res.status(200).json({ token, status: 'active' })
}
