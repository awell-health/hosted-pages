import React, { useEffect } from 'react'
import { Message as MessageViewer } from '@awell_health/ui-library'
import { useMessage, Activity } from '../../hooks/useMessage'
import { LoadingPage } from '../LoadingPage'
import { ErrorPage } from '../ErrorPage'
import { useTranslation } from 'next-i18next'

interface MessageProps {
  activity: Activity
}

export const Message = ({ activity }: MessageProps): JSX.Element => {
  const { t } = useTranslation()
  const { loading, message, error, onRead } = useMessage({
    activity,
  })

  useEffect(() => {
    if (!loading && !error) {
      onRead()
    }
  }, [loading, error])

  if (loading) {
    return <LoadingPage title={t('message_loading')} />
  }

  if (error) {
    return <ErrorPage title={t('message_loading_error', { error })} />
  }

  return (
    <MessageViewer
      content={message?.body || ''} // FIXME
      subject={message?.subject || ''}
    />
  )
}
