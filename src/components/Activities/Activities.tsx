import { FC } from 'react'
import { useTranslation } from 'next-i18next'
import { LoadingPage } from '../LoadingPage'
import { ActivityFactory } from './ActivityFactory'
import { useCurrentActivity } from './hooks'
import { SuccessPage } from '../SuccessPage'

/**
 * This component is used to display the activities for a hosted session.
 * It will display a loading page if the activities are not yet available.
 */
export const Activities: FC = () => {
  const { currentActivity, state } = useCurrentActivity()
  const { t } = useTranslation()

  if (state === 'polling') {
    return <LoadingPage />
  }
  if (state === 'no-active-activity') {
    return (
      <SuccessPage
        redirect={false}
        description={t('session.no_more_pending_activities')}
      />
    )
  }

  return <ActivityFactory activity={currentActivity} />
}
