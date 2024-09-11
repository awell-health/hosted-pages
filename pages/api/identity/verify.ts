import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { environment } from '../../../types'
import { z, ZodIssue } from 'zod'
import { JwtFeature } from '../../../lib'

export const BodySchema = z.object({
  dob: z.coerce.date(),
  activity_id: z.string(),
  pathway_id: z.string(),
})

type Response =
  | {
      success: boolean
    }
  | {
      error: {
        message: string
        errors: ZodIssue[]
      }
    }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Response>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).end('Method Not Allowed')
  }

  const bodyValidation = BodySchema.safeParse(req.body)

  if (!bodyValidation.success) {
    const { errors } = bodyValidation.error

    return res.status(400).json({
      error: { message: 'Invalid request', errors },
    })
  }

  const { activity_id, pathway_id, dob } = bodyValidation.data

  // TODO JB
  const token = jwt.sign(
    {
      username: environment.apiGatewayConsumerName,
      feature: JwtFeature.IdentityVerification,
    },
    environment.jwtAuthSecret,
    {
      issuer: environment.jwtAuthKey,
      subject: activity_id,
    }
  )

  // LATER: we have an "i don't know my DOB" option then we can complete with failure... etc.
  const input = { pathway_id, dob }
  // TODO JB
  const response = await fetch(environment.orchestrationApiUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
            mutation Verify_identity($input: VerifyIdentityInput!) {
              verify_identity(input: $input) {
                  code
                  success
                  is_verified
              }
            }
          `,
      variables: { input },
    }),
  })

  const resp = await response.json()
  console.log(resp)
  const { data, errors } = resp
  const { is_verified } = data?.verify_identity

  if (is_verified) {
    await fetch(environment.orchestrationApiUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
            mutation CompleteExtensionActivity($input: CompleteExtensionActivityInput!) {
              completeExtensionActivity(input: $input) {
                code
                success
              }
            }
          `,
        variables: {
          input: {
            activity_id,
            data_points: [
              {
                key: 'success',
                value: 'true',
              },
            ],
          },
        },
      }),
    })
  }

  res.status(200).json({
    success: is_verified,
    ...(errors && errors.length > 0 && { error: errors }),
  })
}
