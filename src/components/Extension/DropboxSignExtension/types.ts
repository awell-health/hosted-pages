export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'
import { isEmpty, isNil, lowerCase } from 'lodash'
import { z } from 'zod'

export enum ActionKey {
  EMBEDDED_SIGNING = 'embeddedSigning',
}

export const SettingsValidationSchema = z.object({
  clientId: z.string(),
  testMode: z
    .optional(z.enum(['Yes', 'No', 'yes', 'no']))
    .transform((testMode): boolean => {
      if (isEmpty(testMode) || isNil(testMode)) return false

      const serializedTestmode = lowerCase(testMode)

      if (serializedTestmode === 'yes') return true

      return false
    }),
})

export const validateSettings = (
  settings: unknown
): z.infer<typeof SettingsValidationSchema> => {
  const parsedData = SettingsValidationSchema.parse(settings)

  return parsedData
}

export type EmbeddedSigningFields = {
  signUrl: string
  expiresAt: string // ISO8601 string
}
