import { isNil } from 'lodash'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { StartHostedActivitySessionFlow } from '../../src/components/StartHostedActivitySessionFlow'
import { StartHostedActivitySessionParams } from '../../types'

/**
 * Purpose of this page is to support shortened URLs i.e. 'hosted-pages.awellhealth.com/l/<hostedPagesLinkId>'
 */
const HostedPagesLink: NextPage = () => {
  const router = useRouter()

  // if it is a stakeholder session flow (redirected after validation)
  const { hostedPagesLinkId } = router.query as StartHostedActivitySessionParams

  // if it is a shortened URL
  if (!isNil(hostedPagesLinkId) && typeof hostedPagesLinkId === 'string') {
    return (
      <StartHostedActivitySessionFlow hostedPagesLinkId={hostedPagesLinkId} />
    )
  }

  return <></>
}

export default HostedPagesLink
