import { z } from 'zod'

export const OptionSchema = z
  .object({
    id: z.string(),
    label: z.string(),
    value: z.string(),
  })
  .extend({})
  .passthrough() // Allow additional key-value pairs
  .transform((option) => ({
    ...option,
    /**
     * We currently don't support numbers in the remote select component, expectation is that the value is a string.
     * Setting the value to NaN because the UI component expects a number.
     */
    value: NaN,
    value_string: option.value,
  }))

export type SelectOption = z.infer<typeof OptionSchema>
