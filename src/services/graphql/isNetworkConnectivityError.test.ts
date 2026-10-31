/**
 * The network error gate counts only connectivity errors, so a browser whose
 * wording we fail to recognise never sees the gate at all: the patient gets the
 * generic loading error instead. The messages below are what each browser's
 * fetch() rejects with when the request gets no response.
 */
import { describe, expect, it } from 'vitest'
import { isNetworkConnectivityError } from './isNetworkConnectivityError'

const fetchFailure = (message: string) => new TypeError(message)

describe('isNetworkConnectivityError', () => {
  it.each([
    ['Chrome', 'Failed to fetch'],
    ['Chrome with the host appended', 'Failed to fetch (api.awellhealth.com)'],
    ['Firefox', 'NetworkError when attempting to fetch resource.'],
    ['Safari', 'Load failed'],
    ['cross-fetch', 'Network request failed'],
  ])('recognises %s', (_browser, message) => {
    expect(isNetworkConnectivityError(fetchFailure(message))).toBe(true)
  })

  it('does not treat a server error response as a connectivity error', () => {
    const serverError = new Error(
      'Response not successful: Received status code 503'
    )
    serverError.name = 'ServerError'

    expect(isNetworkConnectivityError(serverError)).toBe(false)
  })
})
