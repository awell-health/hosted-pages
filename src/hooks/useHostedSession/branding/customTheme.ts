import { z } from 'zod'
import { Maybe } from '../../../types'
import { stringToJSONSchema } from './stringToJson'

const DEFAULTS = {
  layout: {
    showCloseButton: true,
    showLogo: true,
  },
  form: {
    showProgressBar: true,
    showAsterisksForRequiredQuestions: true,
  },
}

const CustomLayoutBranding = z
  .object({
    showCloseButton: z.boolean().default(DEFAULTS.layout.showCloseButton),
    showLogo: z.boolean().optional().default(DEFAULTS.layout.showLogo),
  })
  .default({})

const CustomFormBranding = z
  .object({
    showProgressBar: z.boolean().default(DEFAULTS.form.showProgressBar),
    showAsterisksForRequiredQuestions: z
      .boolean()
      .default(DEFAULTS.form.showAsterisksForRequiredQuestions),
  })
  .default({})

/**
 * Set default to empty string
 */
const CustomLocales = z
  .object({
    form: z
      .object({
        cta_submit: z.string().default(''),
      })
      .default({}),
  })
  .default({})

const CustomThemeFields = z
  .object({
    layout: CustomLayoutBranding,
    form: CustomFormBranding,
    locales: CustomLocales,
  })
  .default({})

const CustomThemeSchema = stringToJSONSchema.pipe(CustomThemeFields)

export type CustomTheme = z.infer<typeof CustomThemeSchema>

export const getTheme = (customThemeJsonStr?: Maybe<string>): CustomTheme => {
  const customTheme = customThemeJsonStr ?? ''
  return CustomThemeSchema.parse(customTheme)
}
