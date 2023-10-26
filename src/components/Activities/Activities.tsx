import { FC } from 'react'
import { useCurrentActivity } from '../../hooks/activityNavigation'
import { LoadingPage } from '../LoadingPage'
import { useTranslation } from 'next-i18next'
import { Form } from '../Form'
import { Message } from '../Message'
import { Checklist } from '../Checklist'
import { ErrorPage } from '../ErrorPage'
import { Extension } from '../Extension'
import { ActivityObjectType } from '../../hooks/useSessionActivities'

export const Activities: FC = () => {
  const { currentActivity, waitingForNewActivities } = useCurrentActivity()
  const { t } = useTranslation()

  if (waitingForNewActivities) {
    return <LoadingPage title={t('activities.waiting_for_new_activities')} />
  }
  const ActivityComponent = () => {
    switch (currentActivity?.object.type) {
      case ActivityObjectType.Form:
        return <Form activity={currentActivity} />
      case ActivityObjectType.Message:
        return <Message activity={currentActivity} />
      case ActivityObjectType.Checklist:
        return <Checklist activity={currentActivity} />
      case ActivityObjectType.PluginAction:
        return <Extension activity={currentActivity} />
      default:
        return <ErrorPage title={t('activities.activity_not_supported')} />
    }
  }
  return <>{ActivityComponent()}</>
}
