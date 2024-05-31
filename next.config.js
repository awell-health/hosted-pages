const { i18n } = require('./next-i18next.config')
const withImages = require('next-images')
const withPlugins = require('next-compose-plugins')
const { withSentryConfig } = require('@sentry/nextjs')
const { Logging } = require('@google-cloud/logging')
const typedi = require('typedi')
const path = require('path')
const fs = require('fs')
const os = require('os')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
}

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

const nextPlugins = [
  withImages,
  (nextConfig) => withSentryConfig(nextConfig, sentryWebpackPluginOptions),
]

const initialiseLogger = () => {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_KEY) {
    console.error(
      'Environment variable GOOGLE_APPLICATION_CREDENTIALS_KEY is not set'
    )
    return
  }

  console.log('Initializing logger')
  const keyFile = path.join(os.tmpdir(), 'logging-sa-key.json')
  fs.writeFileSync(
    keyFile,
    process.env.GOOGLE_APPLICATION_CREDENTIALS_KEY ?? ''
  )
  const gcpLoggingClient = new Logging({ keyFile })
  const logger = gcpLoggingClient.log('hosted-sessions')
  typedi.Container.set({ id: 'gcpLogger', value: logger })
}

module.exports = async (phase) => {
  const config = withPlugins(nextPlugins, nextConfig)(phase, {})
  if (['phase-production-server', 'phase-development-server'].includes(phase)) {
    initialiseLogger()
  }
  return config
}
