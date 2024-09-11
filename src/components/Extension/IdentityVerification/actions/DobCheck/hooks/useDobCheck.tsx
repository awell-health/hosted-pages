import { useCallback } from 'react'
import { useCompleteExtensionActivity } from '../../../types'

export const useDobCheck = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({ activityId }: { activityId: string }) => {
      return _onSubmit(activityId, [])
    },
    [_onSubmit]
  )

  return {
    isSubmitting,
    onSubmit,
  }
}
