import type { NextApiRequest, NextApiResponse } from 'next'
import { log } from '../../../src/utils/logging'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      const { message, severity, error } = req.body
      log(message, severity, error)
      res.status(200)
      break
    default:
      res.setHeader('Allow', req.method ?? '')
      res.status(405).end('Method Not Allowed')
  }
}
