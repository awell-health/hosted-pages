import { isNil } from 'lodash'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { StartHostedActivitySessionFlow } from '../../src/components/StartHostedActivitySessionFlow'
import { StartHostedActivitySessionParams } from '../../types'

/**
 * Purpose of this page is to extract params from shortened URLs i.e. 'hosted-pages.awellhealth.com/l/<hostedPagesLinkId>'
 * then use this hostedPagesLinkId to fetch params i.e Pathway ID & Stakeholder ID from HostedPagesLink query
 * and call StartHostedActivitySessionFlow when all params are complete
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
