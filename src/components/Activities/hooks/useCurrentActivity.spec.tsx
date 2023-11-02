import { waitFor } from '@testing-library/react'
import { activity_mocks, renderActivityHook } from '../../../../spec'
import { useCurrentActivity } from './useCurrentActivity'
import { ActivityStatus } from '../types'

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

    it('should return waitingForNewActivities: false, and first active activity as currentActivity', async () => {
      const activities = [
        activity_mocks.activity({
          status: ActivityStatus.Done,
        }),
        activity_mocks.activity({
          status: ActivityStatus.Active,
        }),
        activity_mocks.activity({
          status: ActivityStatus.Active,
        }),
      ]
      const { result } = renderActivityHook(useCurrentActivity, {
        mocks: {
          Query: {
            hostedSessionActivities: () => ({
              success: true,
              activities,
            }),
          },
        },
      })
      await waitFor(() => {
        expect(result.current.waitingForNewActivities).toBeFalsy()
        expect(result.current.currentActivity!.id).toEqual(activities[1].id)
      })
    })
  })
})
