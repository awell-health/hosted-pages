/**
 * Extracts UTM parameters and custom parameters from a query object (e.g., from Next.js getServerSideProps context.query)
 * Returns a TrackingInput object suitable for GraphQL mutations
 */
export type TrackingInput = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  custom?: Record<string, unknown>
}

/**
 * Query parameters that are used for system/routing purposes and should not be included in custom tracking
 */
const SYSTEM_QUERY_PARAMS = new Set([
  'hostedPagesLinkId',
  'patient_identifier',
  'track_id',
  'activity_id',
  'sessionId',
  'locale',
])

/**
 * UTM parameter names
 */
const UTM_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
])

export function extractTrackingParams(query: {
  [key: string]: string | string[] | undefined
}): TrackingInput | undefined {
  const utm_source = query.utm_source as string | undefined
  const utm_medium = query.utm_medium as string | undefined
  const utm_campaign = query.utm_campaign as string | undefined
  const utm_term = query.utm_term as string | undefined
  const utm_content = query.utm_content as string | undefined

  // Extract custom params (all params except UTM params and system params)
  const custom: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(query)) {
    // Skip system params and UTM params
    if (SYSTEM_QUERY_PARAMS.has(key) || UTM_PARAMS.has(key)) {
      continue
    }

    // Only include string values (not arrays or undefined)
    if (typeof value === 'string' && value !== '') {
      custom[key] = value
    }
  }

  const hasAnyUtmParam =
    utm_source || utm_medium || utm_campaign || utm_term || utm_content
  const hasCustomParams = Object.keys(custom).length > 0

  // Return tracking object if there are UTM params or custom params
  if (!hasAnyUtmParam && !hasCustomParams) {
    return undefined
  }

  return {
    ...(utm_source && { utm_source }),
    ...(utm_medium && { utm_medium }),
    ...(utm_campaign && { utm_campaign }),
    ...(utm_term && { utm_term }),
    ...(utm_content && { utm_content }),
    ...(hasCustomParams && { custom }),
  }
}
