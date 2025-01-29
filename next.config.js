const { i18n } = require('./next-i18next.config')
const withPlugins = require('next-compose-plugins')
const { withSentryConfig } = require('@sentry/nextjs')

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  images: {
    domains: ['res.cloudinary.com'],
  },
}

const sentryConfig = {
  org: process.env.SENTRY_ORG || 'awell',
  project: process.env.SENTRY_PROJECT || 'hosted-pages',
  authToken: process.env.SENTRY_AUTH_TOKEN || '',
  silent: false,
  hideSourceMaps: true,
}

const nextPlugins = [(nextConfig) => withSentryConfig(nextConfig, sentryConfig)]

module.exports = async (phase) => {
  const config = withPlugins(nextPlugins, nextConfig)(phase, {})
  return config
}
