import type { NextApiRequest, NextApiResponse } from 'next'
import { log } from '../../../src/utils/logging'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Received log request', req)

  switch (req.method) {
    case 'POST':
      const { params, severity, error } = req.body
      log(params, severity, error)
      res.status(200).json({ success: true })
      break
    default:
      res.setHeader('Allow', req.method ?? '')
      res.status(405).end('Method Not Allowed')
  }
}
