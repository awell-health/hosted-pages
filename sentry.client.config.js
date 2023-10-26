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
  // Adjust this value in production, or use tracesSampler for greater control
  // TODO in future use tracesSampler
  tracesSampleRate: 0.5,
  // ...
  // Note: if you want to override the automatic release value, do not set a
  // `release` value here - use the environment variable `SENTRY_RELEASE`, so
  // that it will also get attached to your source maps

  // This sets the sample rate to be 10%. You may want this to be 100% while
  // in development and sample at a lower rate in production
  replaysSessionSampleRate: 0.1,

  // If the entire session is not sampled, use the below sample rate to sample
  // sessions when an error occurs.
  replaysOnErrorSampleRate: 1.0,

  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
      // UNCOMMENT IN SEPARATE TICKET FOR MONITORING/LOGGING
      // networkCaptureBodies: true,
      // networkRequestHeaders: true,
      // networkResponseHeaders: true,
    }),
  ],
})
