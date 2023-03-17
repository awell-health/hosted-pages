import type { ExtensionActionField } from '../../types/generated/types-orchestration'

export const mapActionFieldsToObject = <T extends Record<string, unknown>>(
  fields: ExtensionActionField[]
): T =>
  fields.reduce((previousValue, currentValue) => {
    return {
      ...previousValue,
      [currentValue.id]: currentValue.value,
    }
  }, {}) as T
