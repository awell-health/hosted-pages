import { Language } from '../types/generated/types-orchestration'

/**
 *
 * @param Language enum ('ENGLISH', 'FRENCH')
 * @returns locale_prefix (i.e 'en', 'fr', 'et')
 *
 * @description Language returned from Graphql layer is in the following format:
 * Uppercase full name of the language i.e 'FRENCH', 'ESTONIAN', 'ENGLISH' etc.
 * This helper method converts this format to locale prefixes commonly for i18n routing
 */
export const mapLanguageToLocalePrefix = ({
  language,
}: {
  language: Language
}): string => {
  switch (language) {
    case Language.English:
      return 'en'
    case Language.Estonian:
      return 'et'
    case Language.Dutch:
      return 'nl'
    case Language.French:
      return 'fr'
    default:
      return Language.English
  }
}
