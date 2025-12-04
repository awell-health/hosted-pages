import jwt from 'jsonwebtoken'
import { isNil } from 'lodash'
import { environment } from '../types'
import { JwtFeature } from './jwt-feature'
import { StartHostedActivitySessionParams } from '../types'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../src/utils/errors'
import * as Sentry from '@sentry/nextjs'

export type StartHostedActivitySessionSuccess = {
  sessionId: string
  sessionUrl: string
}

export type StartHostedActivitySessionError = {
  error: string
}

export type StartHostedActivitySessionResult =
  | StartHostedActivitySessionSuccess
  | StartHostedActivitySessionError

/**
 * Server-side function to start a hosted activity session.
 * Extracted from API route to be reusable in getServerSideProps.
 * All error logging and reporting happens here - single source of truth.
 */
export async function startHostedActivitySession(
  params: StartHostedActivitySessionParams
): Promise<StartHostedActivitySessionResult> {
  const { hostedPagesLinkId, track_id, activity_id } = params

  try {
    const token = jwt.sign(
      {
        username: environment.apiGatewayConsumerName,
        feature: JwtFeature.HostedActivitiesLink,
      },
      environment.jwtAuthSecret,
      {
        issuer: environment.jwtAuthKey,
        subject: hostedPagesLinkId,
      }
    )

    const response = await fetch(environment.orchestrationApiUrl, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `
          mutation StartHostedActivitySessionViaHostedPagesLink($input: StartHostedActivitySessionViaHostedPagesLinkInput!) {
            startHostedActivitySessionViaHostedPagesLink(input: $input) {
              session_id
              session_url
            }
          }
          `,
        variables: {
          input: {
            hosted_pages_link_id: hostedPagesLinkId,
          },
        },
      }),
    })

    const { data, errors } = await response.json()
    if (!isNil(errors) && errors.length > 0) {
      const errorMessage =
        errors[0].extensions?.data?.message ??
        errors[0].message ??
        'Unknown error'

      // Log and report error to Sentry
      Sentry.logger.error('Error with hosted activity link', {
        category: 'hosted_activity_error',
        hostedPagesLinkId,
        error: errorMessage,
        track_id,
        activity_id,
      })

      const hostedSessionError = new HostedSessionError(
        `Failed to start hosted activity session: ${errorMessage}`,
        {
          errorType: 'HOSTED_ACTIVITY_SESSION_START_FAILED',
          operation: 'StartHostedActivitySessionViaHostedPagesLink',
          originalError: errors[0],
          contexts: {
            session: {
              hostedPagesLinkId,
              track_id,
              activity_id,
            },
            graphql: {
              query: 'StartHostedActivitySessionViaHostedPagesLink',
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

    const { session_id, session_url } =
      data?.startHostedActivitySessionViaHostedPagesLink

    let additionalParams = ''
    if (!isNil(activity_id)) {
      additionalParams += `&activity_id=${activity_id}`
    } else if (!isNil(track_id)) {
      additionalParams += `&track_id=${track_id}`
    }
    const sessionUrl = `${session_url}${additionalParams}`

    return { sessionId: session_id, sessionUrl }
  } catch (error) {
    // Handle unexpected errors (network failures, JSON parsing errors, etc.)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to start session'

    // Log and report error to Sentry
    Sentry.logger.error('Unexpected error starting hosted activity session', {
      category: 'hosted_activity_error',
      hostedPagesLinkId,
      error: errorMessage,
      track_id,
      activity_id,
    })

    const hostedSessionError = new HostedSessionError(
      `Unexpected error starting hosted activity session: ${errorMessage}`,
      {
        errorType: 'HOSTED_ACTIVITY_SESSION_START_FAILED',
        operation: 'StartHostedActivitySessionViaHostedPagesLink',
        originalError: error,
        contexts: {
          session: {
            hostedPagesLinkId,
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
