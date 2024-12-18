import { z, ZodError } from 'zod'
import { OptionSchema } from './types'

describe('Remote single select action', () => {
  describe('Options schema', () => {
    test('When options schema contains only the required fields, the options are parsed correctly', () => {
      expect(() => {
        const options = [
          {
            id: 'unique-id-1',
            label: 'Choice label 1',
            value: 'Choice value 1',
          },
          {
            id: 'unique-id-2',
            label: 'Choice label 2',
            value: 'Choice value 2',
          },
        ]

        const parsedOptions = z.array(OptionSchema).safeParse(options)

        if (!parsedOptions.success) {
          console.error(JSON.stringify(parsedOptions.error, null, 2))
          throw new ZodError(parsedOptions.error.issues)
        }

        expect(parsedOptions.data).toStrictEqual([
          {
            id: 'unique-id-1',
            label: 'Choice label 1',
            value: NaN,
            value_string: 'Choice value 1',
          },
          {
            id: 'unique-id-2',
            label: 'Choice label 2',
            value: NaN,
            value_string: 'Choice value 2',
          },
        ])
      }).not.toThrow(ZodError)
    })

    test('When options schema contains the required fields but also additional fields, the options are parsed correctly', () => {
      expect(() => {
        const options = [
          {
            id: 'unique-id-1', // minimally required
            label: 'Choice label 1', // minimally required
            value: 'Choice value 1', // minimally required
            // Additional fields are allowed
            additional_field: 'Additional field 1',
            nested_field: {
              nested_field_1: 'Nested field 1',
              nested_field_2: 'Nested field 2',
            },
          },
        ]

        const parsedOptions = z.array(OptionSchema).safeParse(options)

        if (!parsedOptions.success) {
          console.error(JSON.stringify(parsedOptions.error, null, 2))
          throw new ZodError(parsedOptions.error.issues)
        }

        expect(parsedOptions.data).toStrictEqual([
          {
            id: 'unique-id-1',
            label: 'Choice label 1',
            value: NaN,
            value_string: 'Choice value 1',
            additional_field: 'Additional field 1',
            nested_field: {
              nested_field_1: 'Nested field 1',
              nested_field_2: 'Nested field 2',
            },
          },
        ])
      }).not.toThrow(ZodError)
    })

    test('When options schema misses required fields, the options are not parsed correctly', () => {
      expect(() => {
        const options = [
          {
            label: 'Choice label 1',
            value: 'Choice value 1',
          },
          {
            id: 'unique-id-2',
            label: 'Choice label 2',
          },
        ]

        const parsedOptions = z.array(OptionSchema).safeParse(options)

        if (!parsedOptions.success) {
          console.error(JSON.stringify(parsedOptions.error, null, 2))
          throw new ZodError(parsedOptions.error.issues)
        }
      }).toThrow(ZodError)
    })
  })
})
