// List of supported locales based on next-i18next.config.js
const SUPPORTED_LOCALES = ['de', 'en', 'es', 'et', 'fr', 'nl', 'ro', 'ru', 'pl']
const DEFAULT_LOCALE = 'en'

/**
 * Validates a locale and returns a normalized locale code.
 * Falls back to 'en' if the locale is not supported.
 *
 * @param locale - The locale to validate
 * @returns A valid locale code
 */
export const validateLocale = (locale: string): string => {
  // Handle undefined or empty locale
  if (!locale || typeof locale !== 'string') {
    return DEFAULT_LOCALE
  }

  // Normalize locale to lowercase
  const normalizedLocale = locale.toLowerCase()

  // Check if the locale is supported
  if (SUPPORTED_LOCALES.includes(normalizedLocale)) {
    return normalizedLocale
  }

  // Handle common misconfigured locales
  const localeMap: Record<string, string> = {
    english: 'en',
    german: 'de',
    spanish: 'es',
    french: 'fr',
    dutch: 'nl',
    romanian: 'ro',
    russian: 'ru',
    polish: 'pl',
    estonian: 'et',
    eng: 'en',
    ger: 'de',
    spa: 'es',
    fre: 'fr',
    dut: 'nl',
    rom: 'ro',
    rus: 'ru',
    pol: 'pl',
    est: 'et',
  }

  // Check if we can map the misconfigured locale to a supported one
  if (localeMap[normalizedLocale]) {
    return localeMap[normalizedLocale]
  }

  // Try to extract the language part from locales like 'en-US', 'en_US'
  const languageCode = normalizedLocale.split(/[-_]/)[0]
  if (SUPPORTED_LOCALES.includes(languageCode)) {
    return languageCode
  }

  // Fall back to default locale
  return DEFAULT_LOCALE
}
