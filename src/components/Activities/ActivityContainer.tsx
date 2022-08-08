import { FC } from 'react'
import { usePathwayActivities } from '../../hooks/usePathwayActivities'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { ErrorPage } from '../ErrorPage'
import { ActivityProvider } from '../../hooks/activityNavigation'
import { Activities } from './Activities'

export const ActivityContainer: FC<{ pathwayId: string }> = ({ pathwayId }) => {
  const { t } = useTranslation()
  const { activities, loading, error } = usePathwayActivities({ pathwayId })

  if (loading) {
    return <LoadingPage title={t('activity_loading')} />
  }
  if (error) {
    return <ErrorPage title={t('activity_loading_error')} />
  }

  return (
    <ActivityProvider activities={activities}>
      <Activities activities={activities} />
    </ActivityProvider>
  )
}
