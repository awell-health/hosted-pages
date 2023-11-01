import { waitFor } from '@testing-library/react'
import { renderActivityHook } from '../../../spec'
import { useCurrentActivity } from './useCurrentActivity'

describe('useCurrentActivity', () => {
  describe('When no activities', () => {
    it('should return waitingForNewActivities: true, and no currentActivity', async () => {
      const { result } = renderActivityHook(useCurrentActivity, {
        mocks: {
          Query: {
            hostedSessionActivities: () => ({
              success: true,
              activities: [],
            }),
          },
        },
      })
      await waitFor(() => {
        expect(result.current.waitingForNewActivities).toBeTruthy()
        expect(result.current.currentActivity).toBeUndefined()
      })
    })
    // it('should return waitingForNewActivities: true, and no currentActivity', async () => {
    //   const { result } = renderActivityHook(useCurrentActivity)
    //   await waitFor(() => {
    //     expect(result.current.waitingForNewActivities).toBeTruthy()
    //     expect(result.current.currentActivity).toBeUndefined()
    //   })
    // })
  })
})
