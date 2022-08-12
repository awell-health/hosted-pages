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
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
}

const nextPlugins = [
  withImages,
  (nextConfig) => withSentryConfig(nextConfig, sentryWebpackPluginOptions),
]

module.exports = withPlugins([withImages], nextConfig)
