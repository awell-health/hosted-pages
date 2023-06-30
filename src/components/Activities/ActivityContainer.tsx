import { FC } from 'react'
import { useSessionActivities } from '../../hooks/useSessionActivities'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { ErrorPage } from '../ErrorPage'
import { ActivityProvider } from '../../hooks/activityNavigation'
import { Activities } from './Activities'
import { ErrorBoundary } from '../ErrorBoundary'

export const ActivityContainer: FC<{ pathwayId: string }> = ({ pathwayId }) => {
  const { t } = useTranslation()
  const { activities, loading, error, refetch } = useSessionActivities({
    onlyStakeholderActivities: true,
  })

  if (loading) {
    return <LoadingPage title={t('activities.loading')} />
  }

  if (error) {
    return <ErrorPage title={t('activities.loading_error')} onRetry={refetch} />
  }

  return (
    // Styles need to be applied to the ErrorBoundary
    // to make sure layout is rendered correctly.
    <ErrorBoundary
      pathwayId={pathwayId}
      style={{
        flex: 'auto',
        display: 'flex',
        height: '100%',
        flexDirection: 'column',
        overflowY: 'scroll',
      }}
    >
      <ActivityProvider activities={activities}>
        <Activities activities={activities} />
      </ActivityProvider>
    </ErrorBoundary>
  )
}
