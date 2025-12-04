import { FC, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import { LoadingPage } from '../LoadingPage'
import { ActivityFactory } from './ActivityFactory'
import { useCurrentActivity } from './hooks'
import { SuccessPage } from '../SuccessPage'
import { useExitTracking } from '../../hooks/useExitTracking'
import { useHostedSession } from '../../hooks/useHostedSession'
import { logger, LogEvent } from '../../utils/logging'
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
        {
          sessionId: session?.id,
          pathwayId: session?.pathway_id,
          stakeholderId: session?.stakeholder?.id,
          sessionStatus: session?.status,
        }
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
