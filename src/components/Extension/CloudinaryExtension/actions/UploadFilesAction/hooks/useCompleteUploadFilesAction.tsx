import { useCallback } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'

export const useCompleteUploadFilesAction = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async (activityId: string, fileUrls: string[]) => {
      // ! arrays not supported right now
      // TODO: add data points in action-extensions repo
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
