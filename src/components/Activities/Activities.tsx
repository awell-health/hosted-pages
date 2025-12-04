import { useTranslation } from 'next-i18next'
import { FC, useEffect } from 'react'
import { useExitTracking } from '../../hooks/useExitTracking'
import { useHostedSession } from '../../hooks/useHostedSession'
import { LogEvent, logger } from '../../utils/logging'
import { LoadingPage } from '../LoadingPage'
import { SuccessPage } from '../SuccessPage'
import { ActivityFactory } from './ActivityFactory'
import { useCurrentActivity } from './hooks'
/**
 * This component is used to display the activities for a hosted session.
 * It will display a loading page if the activities are not yet available.
 */
export const Activities: FC = () => {
  const { currentActivity, state } = useCurrentActivity()
  const { t } = useTranslation()
  const { session } = useHostedSession()

  // Track session exit events (beforeunload, visibilitychange)
  useExitTracking()

  useEffect(() => {
    if (state === 'no-active-activity') {
      logger.info(
        'No active activity found, displaying success page',
        LogEvent.ACTIVITY_NO_ACTIVE_FOUND,
        {}
      )
    }
  }, [state])

  if (state === 'polling' || state === 'polling-extended') {
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
