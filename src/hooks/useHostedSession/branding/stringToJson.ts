import { z } from 'zod'
import type { json } from './json'

export const stringToJSONSchema = z
  .string()
  .optional()
  .transform((str): z.infer<ReturnType<typeof json>> => {
    try {
      return JSON.parse(str ?? '')
    } catch (e) {
      return {}
    }
  })
