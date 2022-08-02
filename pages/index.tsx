import type { NextPage } from 'next'
import ClientOnly from '../src/components/ClientOnly'
import Activities from '../src/components/Activities/Activities'
import '@awell_health/ui-library/dist/index.css'

//TODO get pathway id & patient id from session
const Home: NextPage = () => {
  return (
    <div>
      <ClientOnly>
        <Activities pathwayId="" />
      </ClientOnly>
    </div>
  )
}

export default Home
