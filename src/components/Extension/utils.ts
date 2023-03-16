import type { PluginActionField } from '../../types/generated/types-orchestration'

export const mapActionFieldsToObject = <T extends Record<string, unknown>>(
  fields: PluginActionField[]
): T =>
  fields.reduce((previousValue, currentValue) => {
    return {
      ...previousValue,
      [currentValue.id]: currentValue.value,
    }
  }, {}) as T
