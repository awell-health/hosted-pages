import { renderHook } from '@testing-library/react'
import { ActivityProvider } from './ActivityProvider'
import { useSessionActivities } from '../useSessionActivities'
import { useCurrentActivity } from './useCurrentActivity'
import { createWrapper } from '../../../spec'

jest.mock('../useSessionActivities')

const getWrapper = () => createWrapper(ActivityProvider, {})

const useSessionActivitiesMock = jest.mocked(useSessionActivities)

describe('useCurrentActivity', () => {
  describe('When no activities', () => {
    beforeEach(() => {
      useSessionActivitiesMock.mockReturnValue({
        activities: [],
        loading: false,
      })
    })
    it('should return waitingForNewActivities: true, and no currentActivity', () => {
      const { result } = renderHook(() => useCurrentActivity(), {
        wrapper: getWrapper(),
      })
      expect(result.current.waitingForNewActivities).toBeTruthy()
      expect(result.current.currentActivity).toBeUndefined()
    })
  })
})
