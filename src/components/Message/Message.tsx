import React from 'react'
import { Message as MessageViewer, Button } from '@awell_health/ui-library'
import { useTranslation } from 'next-i18next'
import { useMessage, Activity } from '../../hooks/useMessage'
import { LoadingPage } from '../LoadingPage'
import { ErrorPage } from '../ErrorPage'
import classes from './message.module.css'

interface MessageProps {
  activity: Activity
}

export const Message = ({ activity }: MessageProps): JSX.Element => {
  const { t } = useTranslation()
  const { loading, message, error, onRead } = useMessage({
    activity,
  })

  if (loading) {
    return <LoadingPage title={t('message_loading')} />
  }

  if (error) {
    return <ErrorPage title={t('message_loading_error', { error })} />
  }

  return (
    <MessageViewer
      content={message?.body || ''}
      subject={message?.subject || ''}
      format="HTML"
    >
      <div className={classes.message_button_wrapper}>
        <Button
          id={`${activity.object.id}-mark-as-read`}
          onClick={() => onRead()}
        >
          {t('done')}
        </Button>
      </div>
    </MessageViewer>
  )
}
