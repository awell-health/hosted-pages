// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import jwt from 'jsonwebtoken'
import { type HostedPagesLinkParams, environment } from '../../../types'

type Data = {
  stakeholderId: string
  tenantId: string
  pathwayId: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const { hostedPagesLinkId } = req.query as HostedPagesLinkParams

  const token = jwt.sign(
    {
      username: environment.apiGatewayConsumerName,
      feature: 'hosted-pages-link',
      hosted_pages_link_id: hostedPagesLinkId,
    },
    environment.jwtAuthSecret,
    {
      issuer: environment.jwtAuthKey,
    }
  )

  const hosted_pages_link = await fetch(environment.orchestrationApiUrl, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: `
          query HostedPagesLink($id: String!) {
            hostedPagesLink(id: $id) {
              hosted_pages_link {
                stakeholder_id
                tenant_id
                pathway_id
              }
            }
          }
          `,
      variables: {
        id: hostedPagesLinkId,
      },
    }),
  })

  const link_response = await hosted_pages_link.json()

  const {
    stakeholder_id: stakeholderId,
    tenant_id: tenantId,
    pathway_id: pathwayId,
  } = link_response?.data.hostedPagesLink.hosted_pages_link

  res.status(200).json({ stakeholderId, tenantId, pathwayId })
}
