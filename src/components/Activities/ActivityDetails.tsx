import { FC } from 'react'
import {
  Activity,
  ActivityObjectType,
} from '../../types/generated/types-orchestration'
import { useTranslation } from 'next-i18next'
import { Form } from '../Form/Form'

interface ActivityContentProps {
  activity: Activity
}

// TODO add query for message and checklist details

export const ActivityDetails: FC<ActivityContentProps> = ({ activity }) => {
  const { t } = useTranslation()
  switch (activity?.object.type) {
    case ActivityObjectType.Form:
      return <Form activity={activity} />
    case ActivityObjectType.Message:
      return <div>TO BE DONE</div>
    case ActivityObjectType.Checklist:
      return <div>TO BE DONE</div>
    default:
      return <div style={{ textAlign: 'center' }}>{t('no_details')}</div>
  }
}

ActivityDetails.displayName = 'ActivityDetails'
