import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { environment } from '../../../types'
import { isNil } from 'lodash'
import { z, ZodIssue } from 'zod'
import { isSameDay } from 'date-fns'

export const BodySchema = z.object({
  dob: z.coerce.date(),
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

  const requestBody = bodyValidation.data

  // TODO JB
  //   const token = jwt.sign(
  //     {
  //       username: environment.apiGatewayConsumerName,
  //       feature: 'hosted-pathway-link',
  //     },
  //     environment.jwtAuthSecret,
  //     {
  //       issuer: environment.jwtAuthKey,
  //       subject: hostedPagesLinkId,
  //     }
  //   )

  // TODO JB
  //   const response = await fetch(environment.orchestrationApiUrl, {
  //     method: 'POST',
  //     headers: {
  //       authorization: `Bearer ${token}`,
  //       'Content-Type': 'application/json',
  //     },
  //     body: JSON.stringify({
  //       query: `
  //           mutation StartHostedPathwaySessionFromLink($input: StartHostedPathwaySessionFromLinkInput!) {
  //             startHostedPathwaySessionFromLink(input: $input) {
  //               session_url
  //             }
  //           }
  //         `,
  //       variables: { input },
  //     }),
  //   })

  //   const { data, errors } = await response.json()

  // if (!isNil(errors) && errors.length > 0) {
  //   res
  //     .status(200)
  //     .json({ error: errors[0].extensions?.data?.message ?? errors[0].message })
  //   return
  // }

  // Mocking a date now, this should be replaced
  const dobPatientProfile = new Date('1993-11-30T00:00:00.000Z')
  const dobToCheck = new Date(requestBody.dob)

  if (isSameDay(dobPatientProfile, dobToCheck)) {
    res.status(200).json({ success: true })
    return
  }

  res.status(200).json({ success: false })
}
