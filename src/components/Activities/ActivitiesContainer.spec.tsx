import React from 'react'
import { render } from '@testing-library/react'
import { ActivitiesContainer } from './ActivitiesContainer'
import { useSessionActivities } from '../../hooks/useSessionActivities'

jest.mock('../../hooks/useSessionActivities')

const useSessionActivitiesMock = jest.mocked(useSessionActivities)

describe('<ActivitiesContainer />', () => {
  describe('when activities fetch fails', () => {
    beforeEach(() => {
      useSessionActivitiesMock.mockReturnValue({
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
      useSessionActivitiesMock.mockReturnValue({
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
      useSessionActivitiesMock.mockReturnValue({
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
