import { FC } from 'react'
import {
  Activity,
  ActivityObjectType,
} from '../../types/generated/types-orchestration'
import { useTranslation } from 'next-i18next'
import { Form } from '../Form'
import { Message } from '../Message'
import { Checklist } from '../Checklist'
import { ErrorPage } from '../ErrorPage'

interface ActivityContentProps {
  activity: Activity
}

export const ActivityDetails: FC<ActivityContentProps> = ({ activity }) => {
  const { t } = useTranslation()
  switch (activity?.object.type) {
    case ActivityObjectType.Form:
      return <Form activity={activity} />
    case ActivityObjectType.Message:
      return <Message activity={activity} />
    case ActivityObjectType.Checklist:
      return <Checklist activity={activity} />
    default:
      return <ErrorPage title={t('activity_not_supported')} />
  }
}

ActivityDetails.displayName = 'ActivityDetails'
