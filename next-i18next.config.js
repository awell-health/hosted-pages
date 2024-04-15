const path = require('path')

module.exports = {
  i18n: {
    // These are all the locales you want to support in
    // your application
    locales: ['de', 'en', 'es', 'et', 'fr', 'nl', 'ro', 'ru'],
    // When localeDetection is set to false Next.js will no longer automatically
    // redirect based on the user's preferred locale and will only provide locale
    // information detected from either the locale based domain or locale path as described above.
    localeDetection: false,
    defaultLocale: 'en',
    localePath: path.resolve('./public/locales'),
  },
}
