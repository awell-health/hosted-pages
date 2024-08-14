import type { NextPage } from 'next'
import { ThemeProvider, HostedPageLayout } from '@awell-health/ui-library'
import 'react-toastify/dist/ReactToastify.css'
import awell_logo from '../src/assets/logo.svg'
import { NoSSRComponent } from '../src/components/NoSSR'
import { addDays } from 'date-fns'

import { Scheduler } from '@awell-health/sol-scheduling'
import '@awell-health/sol-scheduling/style.css'

const AWELL_BRAND_COLOR = '#004ac2'

const Sol: NextPage = () => {
  const props = {
    provider: {
      name: 'Nick Hellemans',
    },
    timeZone: 'Europe/Brussels',
    availabilities: [
      addDays(new Date().setUTCHours(9, 0), 1),
      addDays(new Date().setUTCHours(11, 0), 1),
      addDays(new Date().setUTCHours(14, 0), 1),
      addDays(new Date().setUTCHours(16, 0), 1),
      addDays(new Date().setUTCHours(9, 0), 2),
      addDays(new Date().setUTCHours(10, 0), 2),
      addDays(new Date().setUTCHours(12, 0), 3),
      addDays(new Date().setUTCHours(9, 0), 5),
      addDays(new Date().setUTCHours(9, 0), 9),
      addDays(new Date().setUTCHours(10, 0), 9),
      addDays(new Date().setUTCHours(9, 0), 10),
      addDays(new Date().setUTCHours(9, 0), 11),
      addDays(new Date().setUTCHours(10, 0), 11),
      addDays(new Date().setUTCHours(9, 0), 12),
      addDays(new Date().setUTCHours(9, 0), 13),
    ],
  }

  return (
    <>
      <NoSSRComponent>
        {/* 
          Styles need to be applied to the ErrorBoundary
          to make sure layout is rendered correctly. 
        */}
        <ThemeProvider accentColor={AWELL_BRAND_COLOR}>
          <HostedPageLayout
            logo={awell_logo}
            onCloseHostedPage={() => window.close()}
          >
            <div
              style={{
                textAlign: 'center',
                margin: '0 auto',
                width: '1200px',
              }}
            >
              <Scheduler {...props} />
            </div>
          </HostedPageLayout>
        </ThemeProvider>
      </NoSSRComponent>
    </>
  )
}

export default Sol
