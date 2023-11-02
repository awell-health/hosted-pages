/**
 * Masker function to mask sensitive data from form related breadcrumbs. This assumes
 * that the object(s) have a field called value that needs to be masked.
 * @param value this is the value to be masked, can be an object or an array of
 * objects with a value field
 * @returns the masked object or array of objects
 */
export const masker = (
  value: Record<string, any> | Array<Record<string, any>>
): any => {
  if (Array.isArray(value)) {
    return value.map(masker)
  }

  if (typeof value === 'object' && value !== null && value !== undefined) {
    return Object.fromEntries(
      Object.entries(value).map(([key, value]) => {
        if (key !== 'value') {
          return [key, value]
        }
        return [
          key,
          typeof value === 'string' || typeof value === 'number'
            ? '*'.repeat(value.toString().length)
            : masker(value),
        ]
      })
    )
  }

  return value
}
