import jwt from 'jsonwebtoken'
import { isNil } from 'lodash'
import { environment } from '../types'
import { JwtFeature } from './jwt-feature'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../src/utils/errors'
import * as Sentry from '@sentry/nextjs'
import { TrackingInput } from '../src/utils/extractTrackingParams'

export type StartHostedPathwaySessionSuccess = {
  sessionUrl: string
  organization_slug?: string | null
}

export type StartHostedPathwaySessionError = {
  error: string
}

export type StartHostedPathwaySessionResult =
  | StartHostedPathwaySessionSuccess
  | StartHostedPathwaySessionError

const decodePatientIdentifier = (
  patientIdentifier: string
): { system: string; value: string } => {
  const decodedPatientIdentifier = decodeURIComponent(patientIdentifier)
  const system = decodedPatientIdentifier.split('|')[0]
  const value = decodedPatientIdentifier.split('|')[1]
  return { system, value }
}

/**
 * Server-side function to start a hosted pathway session.
 * Extracted from API route to be reusable in getServerSideProps.
 * All error logging and reporting happens here - single source of truth.
 */
export async function startHostedPathwaySession(params: {
  hostedPagesLinkId: string
  patient_identifier?: string
  track_id?: string
  activity_id?: string
  tracking?: TrackingInput
}): Promise<StartHostedPathwaySessionResult> {
  const {
    hostedPagesLinkId,
    patient_identifier,
    track_id,
    activity_id,
    tracking,
  } = params

  try {
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
    const input = {
      ...(hasPatientIdentifier
        ? {
            id: hostedPagesLinkId,
            patient_identifier: decodePatientIdentifier(patient_identifier),
          }
        : { id: hostedPagesLinkId }),
      ...(tracking && { tracking }),
    }

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
              organization_slug
            }
          }
        `,
        variables: { input },
      }),
    })

    const { data, errors } = await response.json()
    if (!isNil(errors) && errors.length > 0) {
      const errorMessage =
        errors[0].extensions?.data?.message ??
        errors[0].message ??
        'Unknown error'

      // Try to extract organization_slug from response if available
      const organization_slug =
        data?.startHostedPathwaySessionFromLink?.organization_slug

      // Log and report error to Sentry
      Sentry.logger?.error('Error with hosted pathway link', {
        category: 'hosted_pathway_error',
        hostedPagesLinkId,
        error: errorMessage,
        patient_identifier,
        track_id,
        activity_id,
        organization_slug,
      })

      const hostedSessionError = new HostedSessionError(
        `Failed to start hosted pathway session: ${errorMessage}`,
        {
          errorType: 'HOSTED_PATHWAY_SESSION_START_FAILED',
          operation: 'StartHostedPathwaySessionFromLink',
          originalError: errors[0],
          tags: organization_slug ? { organization_slug } : undefined,
          contexts: {
            session: {
              hostedPagesLinkId,
              patient_identifier,
              track_id,
              activity_id,
            },
            ...(organization_slug
              ? { organization_slug: { organization_slug } }
              : {}),
            graphql: {
              query: 'StartHostedPathwaySessionFromLink',
              errors: JSON.stringify(errors),
            },
          },
        }
      )
      captureHostedSessionError(hostedSessionError)

      return {
        error: errorMessage,
      }
    }

    const session_url = data?.startHostedPathwaySessionFromLink?.session_url
    const organization_slug =
      data?.startHostedPathwaySessionFromLink?.organization_slug

    // Validate that session_url exists and is not null/undefined
    if (isNil(session_url)) {
      const errorMessage = 'Session URL is missing from GraphQL response'

      // Log and report error to Sentry
      Sentry.logger?.error('Missing session_url in GraphQL response', {
        category: 'hosted_pathway_error',
        hostedPagesLinkId,
        patient_identifier,
        track_id,
        activity_id,
        organization_slug,
      })

      const hostedSessionError = new HostedSessionError(
        `Failed to start hosted pathway session: ${errorMessage}`,
        {
          errorType: 'HOSTED_PATHWAY_SESSION_START_FAILED',
          operation: 'StartHostedPathwaySessionFromLink',
          tags: organization_slug ? { organization_slug } : undefined,
          contexts: {
            session: {
              hostedPagesLinkId,
              patient_identifier,
              track_id,
              activity_id,
            },
            ...(organization_slug
              ? { organization_slug: { organization_slug } }
              : {}),
            graphql: {
              query: 'StartHostedPathwaySessionFromLink',
              response_data: JSON.stringify(data),
            },
          },
        }
      )
      captureHostedSessionError(hostedSessionError)

      return {
        error: errorMessage,
      }
    }

    let additionalParams = ''
    if (!isNil(activity_id)) {
      additionalParams += `&activity_id=${activity_id}`
    } else if (!isNil(track_id)) {
      additionalParams += `&track_id=${track_id}`
    }

    const sessionUrl = `${session_url}${additionalParams}`

    return { sessionUrl, organization_slug }
  } catch (error) {
    // Handle unexpected errors (network failures, JSON parsing errors, etc.)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to start session'

    // Log and report error to Sentry
    Sentry.logger?.error('Unexpected error starting hosted pathway session', {
      category: 'hosted_pathway_error',
      hostedPagesLinkId,
      error: errorMessage,
      patient_identifier,
      track_id,
      activity_id,
      // organization_slug not available in catch block as mutation hasn't completed
    })

    const hostedSessionError = new HostedSessionError(
      `Unexpected error starting hosted pathway session: ${errorMessage}`,
      {
        errorType: 'HOSTED_PATHWAY_SESSION_START_FAILED',
        operation: 'StartHostedPathwaySessionFromLink',
        originalError: error,
        contexts: {
          session: {
            hostedPagesLinkId,
            patient_identifier,
            track_id,
            activity_id,
          },
        },
      }
    )
    captureHostedSessionError(hostedSessionError)

    return {
      error: errorMessage,
    }
  }
}
