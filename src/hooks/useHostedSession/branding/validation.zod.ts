import { z } from 'zod'
import { stringToJSONSchema } from './stringToJson'

const DEFAULTS = {
  layout: {
    showCloseButton: true,
    showLogo: true,
  },
  form: {
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
    showAsterisksForRequiredQuestions: z
      .boolean()
      .default(DEFAULTS.form.showAsterisksForRequiredQuestions),
  })
  .default({})

const CustomThemeFields = z
  .object({
    layout: CustomLayoutBranding,
    form: CustomFormBranding,
  })
  .default({})

export const CustomThemeApiField = stringToJSONSchema.pipe(CustomThemeFields)

export type CustomThemeFieldsType = z.infer<typeof CustomThemeApiField>
