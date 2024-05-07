import type { NextApiRequest, NextApiResponse } from 'next'
import Stripe from 'stripe'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'POST':
      try {
        const {
          hostedPagesSessionId,
          mode,
          item,
          hostedPagesEnvironmentVariable,
        } = req.body

        /**
         * This is hacky but it works.
         * Ideally we can fetch obfuscated settings here from Orchestration
         */
        const stripeSecret = process.env[hostedPagesEnvironmentVariable]

        if (!stripeSecret) {
          res.status(500).json('Missing environment variable for Stripe secret')
          return
        }

        const stripe = new Stripe(stripeSecret)

        const session = await stripe.checkout.sessions.create({
          ui_mode: 'embedded',
          line_items: [
            {
              price: item,
              quantity: 1,
            },
          ],
          mode: mode,
          return_url: `${req.headers.origin}/?sessionId=${hostedPagesSessionId}&stripeSessionId={CHECKOUT_SESSION_ID}`,
        })

        res.send({ clientSecret: session.client_secret })
      } catch (err) {
        const error = err as { statusCode?: number; message: string }

        res.status(error.statusCode || 500).json(error.message)
      }
      break
    case 'GET':
      try {
        const { stripeSessionId, hostedPagesEnvironmentVariable } = req.query

        if (!stripeSessionId) {
          res.status(404).json('Missing Stripe session ID')
          return
        }

        /**
         * This is hacky but it works.
         * Ideally we can fetch obfuscated settings here from Orchestration
         */
        const stripeSecret =
          process.env[String(hostedPagesEnvironmentVariable)] ?? ''

        if (!stripeSecret) {
          res
            .status(500)
            .json('Missing environment variable for Stripe secret.')
          return
        }

        const stripe = new Stripe(stripeSecret)

        const session = await stripe.checkout.sessions.retrieve(
          stripeSessionId as string
        )

        res.send({
          status: session.status,
        })
      } catch (err) {
        const error = err as { statusCode?: number; message: string }

        res.status(error.statusCode || 500).json(error.message)
      }
      break
    default:
      res.setHeader('Allow', req.method ?? '')
      res.status(405).end('Method Not Allowed')
  }
}
