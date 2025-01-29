const { i18n } = require('./next-i18next.config')
const withPlugins = require('next-compose-plugins')
const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
  images: {
    domains: ['res.cloudinary.com'],
  },
}

const sentryWebpackPluginOptions = {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

const nextPlugins = [
  (nextConfig) => withSentryConfig(nextConfig, sentryWebpackPluginOptions),
]

module.exports = async (phase) => {
  const config = withPlugins(nextPlugins, nextConfig)(phase, {})
  return config
}
