import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { NoSSRComponent } from '../../src/components/NoSSR'

const Start: NextPage = () => {
  const router = useRouter()
  console.log('ASDSDADSA', window)
  return (
    <NoSSRComponent>
      <div>Hello world!</div>
    </NoSSRComponent>
  )
}

export default Start
