import { FC } from 'react'
import { useTranslation } from 'next-i18next'
import { LoadingPage } from '../LoadingPage'
import { ActivityFactory } from './ActivityFactory'
import { useCurrentActivity } from './hooks'
import { SuccessPage } from '../SuccessPage'
import { LogEvent } from '../../hooks/useLogging/types'
import { useLogging } from '../../hooks/useLogging'
/**
 * This component is used to display the activities for a hosted session.
 * It will display a loading page if the activities are not yet available.
 */
export const Activities: FC = () => {
  const { currentActivity, state } = useCurrentActivity()
  const { t } = useTranslation()
  const { infoLog } = useLogging()

  if (state === 'polling' || state === 'polling-extended') {
    return <LoadingPage />
  }
  if (state === 'no-active-activity') {
    infoLog(
      `No active activity found, displaying success page`,
      {},
      LogEvent.ACTIVITY_NO_ACTIVE_FOUND
    )
    return (
      <SuccessPage
        redirect={false}
        description={t('session.no_more_pending_activities')}
      />
    )
  }

  return <ActivityFactory activity={currentActivity} />
}
