const { i18n } = require('./next-i18next.config')
const withImages = require('next-images')
const withPlugins = require('next-compose-plugins')
const { withSentryConfig } = require('@sentry/nextjs')

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

module.exports = withPlugins(nextPlugins, nextConfig)
