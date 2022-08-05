import { FC } from 'react'
import {
  Activity,
  ActivityObjectType,
} from '../../types/generated/types-orchestration'
import { useTranslation } from 'next-i18next'
import { Form } from '../Form'
import { Message } from '../Message'
import { Checklist } from '../Checklist'

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
      return <div style={{ textAlign: 'center' }}>{t('no_details')}</div>
  }
}

ActivityDetails.displayName = 'ActivityDetails'
