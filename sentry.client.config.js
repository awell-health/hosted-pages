// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs'

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN

Sentry.init({
  dsn: SENTRY_DSN,
  // These environment EnvVars are set automatically on Vercel and do not need to be configured
  // They ensure that the correct environment is set in Sentry as this is a known issue
  // See https://github.com/getsentry/sentry-javascript/issues/6993 for latest
  environment: process.env.NEXT_PUBLIC_AWELL_ENVIRONMENT,
  // This sets the sample rate to be 50% for all transactions
  tracesSampleRate: 0.5,
  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,
  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,
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
  integrations: [
    new Sentry.Replay({
      maskAllInputs: true,
      blockAllMedia: true,
      networkDetailAllowUrls: [
        'https://api.awellhealth.com/orchestration/graphql',
        'https://api.uk.awellhealth.com/orchestration/graphql',
        'https://api.us.awellhealth.com/orchestration/graphql',
        'https://api.sandbox.awellhealth.com/orchestration/graphql',
        'https://api.staging.awellhealth.com/orchestration/graphql',
        'https://api.development.awellhealth.com/orchestration/graphql',
      ],
      networkRequestHeaders: ['user-agent', 'content-type', 'referer'],
      networkResponseHeaders: [
        'content-type',
        'content-length',
        'content-encoding',
      ],
      // TODO: Decide on capturing in production, if masking form data before send isn't good (enough)
      // networkCaptureBodies: !process.env.NODE_ENV.includes('prod'),
    }),
  ],
})
