import React, { useEffect } from 'react'
import { Activity, ActivityObjectType } from './types'
import { useTranslation } from 'next-i18next'
import { Form } from '../Form'
import { Message } from '../Message'
import { Checklist } from '../Checklist'
import { ErrorPage } from '../ErrorPage'
import { Extension } from '../Extension'
import { useLogging } from '../../hooks/useLogging'

export const ActivityFactory = ({ activity }: { activity?: Activity }) => {
  const { t } = useTranslation()
  const { infoLog } = useLogging()

  useEffect(() => {
    infoLog({ msg: 'Loading new activity', activity })
  }, [])

  switch (activity?.object.type) {
    case ActivityObjectType.Form:
      return <Form activity={activity} key={activity.id} />
    case ActivityObjectType.Message:
      return <Message activity={activity} key={activity.id} />
    case ActivityObjectType.Checklist:
      return <Checklist activity={activity} key={activity.id} />
    case ActivityObjectType.PluginAction:
      return <Extension activity={activity} key={activity.id} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}
