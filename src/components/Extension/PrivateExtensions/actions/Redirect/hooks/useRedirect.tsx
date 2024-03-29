import { useCallback } from 'react'
import {
  DataPoints,
  useCompleteExtensionActivity,
} from '../../EnterMedication/types'

export const useRedirect = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({ activityId }: { activityId: string }) => {
      const dataPoints: DataPoints = []

      return _onSubmit(activityId, dataPoints)
    },
    [_onSubmit]
  )

  return {
    isSubmitting,
    onSubmit,
  }
}
