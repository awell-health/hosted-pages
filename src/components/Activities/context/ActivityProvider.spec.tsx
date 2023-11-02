import { screen } from '@testing-library/react'
import { render } from '../../../../spec'
import { ActivityProvider } from './ActivityProvider'

describe('ActivityProvider', () => {
  it('should display error page', async () => {
    render(<ActivityProvider />, {
      mocks: {
        Query: {
          // We can return whatever data we want here.
          // Including partial responses like `({ id: 1 })`
          // Apollo will use our schema to fill out the rest for us
          hostedSessionActivities: () => {
            throw new Error('Error loading activities')
          },
        },
      },
    })

    await screen.findByText('activities.loading_error')
  })

  it('should display loading page', async () => {
    render(<ActivityProvider />, {
      mocks: {
        Query: {
          hostedSessionActivities: () =>
            new Promise((resolve) => setTimeout(() => resolve([]), 1000)),
        },
      },
    })
    await screen.findByText('activities.loading')
  })

  it('should display child component', async () => {
    render(
      <ActivityProvider>
        <div>child</div>
      </ActivityProvider>,
      {
        mocks: {
          Query: {
            hostedSessionActivities: () => ({
              success: true,
              activities: [],
            }),
          },
        },
      }
    )
    await screen.findByText('child')
  })
})
