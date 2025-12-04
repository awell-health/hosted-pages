import { FC } from 'react'
import { StartHostedActivitySessionParams } from '../../../types'
import { ErrorPage } from '../ErrorPage'
import { useTranslation } from 'next-i18next'

type StartHostedActivitySessionFlowProps = StartHostedActivitySessionParams & {
  error?: string
}

/**
 * Simplified component for SSR approach.
 * All session creation and redirect logic is handled server-side in getServerSideProps.
 * This component only renders the error state if provided.
 */
export const StartHostedActivitySessionFlow: FC<
  StartHostedActivitySessionFlowProps
> = ({ error }): JSX.Element => {
  const { t } = useTranslation()

  if (error) {
    const retry = () => {
      window.location.reload()
    }

    return (
      <ErrorPage
        title={`${t('link_page.loading_error')} ${error}`}
        onRetry={retry}
      />
    )
  }

  // This should never be reached in SSR mode since server redirects on success
  // But kept as fallback for edge cases
  return <></>
}
