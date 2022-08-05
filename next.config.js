const { i18n } = require('./next-i18next.config')
const withImages = require('next-images')
const withPlugins = require('next-compose-plugins')
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  i18n,
}

module.exports = withPlugins([withImages], nextConfig)
