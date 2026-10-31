/**
 * True when a request never got a response: fetch() rejected rather than the
 * server answering with an error.
 *
 * Each browser words that rejection differently, and Chrome now appends the
 * host ("Failed to fetch (api.awellhealth.com)"), so match substrings rather
 * than whole messages.
 */
const FETCH_FAILURE_MESSAGES = [
  'Failed to fetch', // Chrome, Edge
  'NetworkError', // Firefox: "NetworkError when attempting to fetch resource."
  'Load failed', // Safari
  'Network request failed', // cross-fetch
]

export const isNetworkConnectivityError = (error: Error): boolean =>
  FETCH_FAILURE_MESSAGES.some((message) => error.message.includes(message))
