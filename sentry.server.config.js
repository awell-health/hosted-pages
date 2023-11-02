// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 0.5,
  beforeSend(event) {
    // for form submission requests, we want to mask the body
    if (event.request?.data?.variables?.input?.answers?.length > 0) {
      // mask the value field of each object in the array
      event.request.data.variables.input.answers.forEach(
        // replace the value with equal number of asterisks as length of value
        (answer) => (answer.value = '*'.repeat(answer.value.length))
      )
    }
    if (event.request?.data?.variables?.input?.responses?.length > 0) {
      // mask the value field of each object in the array
      event.request.data.variables.input.responses.forEach(
        // replace the value with equal number of asterisks as length of value
        (response) => (response.value = '*'.repeat(response.value.length))
      )
    }
    return event
  },
})
