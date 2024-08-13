import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      res.send({ success: true })
      break
    default:
      res.setHeader('Allow', req.method ?? '')
      res.status(405).end('Method Not Allowed')
  }
}
