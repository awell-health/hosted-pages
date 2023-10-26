import React from 'react'
import { Activity, ActivityObjectType } from './types'
import { useTranslation } from 'next-i18next'
import { Form } from '../Form'
import { Message } from '../Message'
import { Checklist } from '../Checklist'
import { ErrorPage } from '../ErrorPage'
import { Extension } from '../Extension'

export const ActivityFactory = ({ activity }: { activity?: Activity }) => {
  const { t } = useTranslation()

  switch (activity?.object.type) {
    case ActivityObjectType.Form:
      return <Form activity={activity} />
    case ActivityObjectType.Message:
      return <Message activity={activity} />
    case ActivityObjectType.Checklist:
      return <Checklist activity={activity} />
    case ActivityObjectType.PluginAction:
      return <Extension activity={activity} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}
