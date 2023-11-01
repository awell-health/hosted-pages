import React from 'react'
import { render } from '@testing-library/react'
import { ActivitiesContainer } from './ActivitiesContainer'
import * as useSessionActivitiesHook from '../../hooks/useSessionActivities'

describe('<ActivitiesContainer />', () => {
  const useSessionActivitiesSpy = vi.spyOn(
    useSessionActivitiesHook,
    'useSessionActivities'
  )
  describe('when activities fetch fails', () => {
    beforeEach(() => {
      useSessionActivitiesSpy.mockReset()
      useSessionActivitiesSpy.mockReturnValue({
        activities: [],
        error: 'Fetch error',
        loading: false,
      })
    })
    it('then it should render error page', () => {
      const { getByText } = render(<ActivitiesContainer />)
      expect(getByText('activities.loading_error')).toBeInTheDocument()
    })
  })

  describe('when activities fetch is loading', () => {
    beforeEach(() => {
      useSessionActivitiesSpy.mockReset()
      useSessionActivitiesSpy.mockReturnValue({
        activities: [],
        loading: true,
      })
    })
    it('then it should render loading page', () => {
      const { getByText } = render(<ActivitiesContainer />)
      expect(getByText('activities.loading')).toBeInTheDocument()
    })
  })

  describe('when no activities', () => {
    beforeEach(() => {
      useSessionActivitiesSpy.mockReset()
      useSessionActivitiesSpy.mockReturnValue({
        activities: [],
        loading: false,
      })
    })
    it('then it should render loading page', () => {
      const { getByText } = render(<ActivitiesContainer />)
      expect(
        getByText('activities.waiting_for_new_activities')
      ).toBeInTheDocument()
    })
  })
})
