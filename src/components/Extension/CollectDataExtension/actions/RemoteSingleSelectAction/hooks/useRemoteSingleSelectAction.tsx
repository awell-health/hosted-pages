import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'
import { SelectOption } from '../types'

export const useRemoteSingleSelectAction = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      selectedOption,
    }: {
      activityId: string
      selectedOption: SelectOption
    }) => {
      const dataPoints: DataPoints = [
        { key: 'label', value: String(selectedOption.label) },
        { key: 'value', value: String(selectedOption.value) },
        { key: 'selectedOption', value: JSON.stringify(selectedOption) },
      ]

      return _onSubmit(activityId, dataPoints)
    },
    [_onSubmit]
  )

  return {
    isSubmitting,
    onSubmit,
  }
}
