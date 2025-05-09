// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { environment } from '../../../types'
import { isNil } from 'lodash'
import { JwtFeature } from '../../../lib'

export type StartHostedCareflowSessionParams = {
  hostedPagesLinkId: string
  patient_identifier?: string
  track_id?: string
  activity_id?: string
}

export type StartHostedCareflowSessionPayload = {
  sessionUrl: string
  error?: string
}

type Data =
  | StartHostedCareflowSessionPayload
  | {
      error: any
    }

const decodePatientIdentifier = (
  patientIdentifier: string
): { system: string; value: string } => {
  const decodedPatientIdentifier = decodeURIComponent(patientIdentifier)
  const system = decodedPatientIdentifier.split('|')[0]
  const value = decodedPatientIdentifier.split('|')[1]
  return { system, value }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { hostedPagesLinkId, patient_identifier, track_id, activity_id } =
    req.query as StartHostedCareflowSessionParams

  const token = jwt.sign(
    {
      username: environment.apiGatewayConsumerName,
      feature: JwtFeature.HostedPathwayLink,
    },
    environment.jwtAuthSecret,
    {
      issuer: environment.jwtAuthKey,
      subject: hostedPagesLinkId,
    }
  )

  const hasPatientIdentifier =
    !isNil(patient_identifier) && patient_identifier !== 'undefined'
  const input = hasPatientIdentifier
    ? {
        id: hostedPagesLinkId,
        patient_identifier: decodePatientIdentifier(patient_identifier),
      }
    : { id: hostedPagesLinkId }

  const response = await fetch(environment.orchestrationApiUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
          mutation StartHostedPathwaySessionFromLink($input: StartHostedPathwaySessionFromLinkInput!) {
            startHostedPathwaySessionFromLink(input: $input) {
              session_url
            }
          }
        `,
      variables: { input },
    }),
  })
  const { data, errors } = await response.json()
  if (!isNil(errors) && errors.length > 0) {
    res
      .status(200)
      .json({ error: errors[0].extensions?.data?.message ?? errors[0].message })
    return
  }

  let additionalParams = ''
  if (!isNil(activity_id)) {
    additionalParams += `&activity_id=${activity_id}`
  } else if (!isNil(track_id)) {
    additionalParams += `&track_id=${track_id}`
  }

  const sessionUrl = `${data?.startHostedPathwaySessionFromLink.session_url}${additionalParams}`

  res.status(200).json({ sessionUrl })
}
