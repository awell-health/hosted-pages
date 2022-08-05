import React, { useEffect } from 'react'
import { Message as MessageViewer } from '@awell_health/ui-library'
import { useMessage, Activity } from '../../hooks/useMessage'
import { LoadingPage } from '../LoadingPage'
import { ErrorPage } from '../ErrorPage'

interface MessageProps {
  activity: Activity
}

export const Message = ({ activity }: MessageProps): JSX.Element => {
  const { loading, message, error, onRead } = useMessage({
    activity,
  })

  useEffect(() => {
    if (!loading && !error) {
      onRead()
    }
  }, [loading, error])

  if (loading) {
    return <LoadingPage title="Loading message" />
  }

  if (error) {
    return <ErrorPage title={error} />
  }

  return (
    <MessageViewer
      content={message?.body || ''} // FIXME
      subject={message?.subject || ''}
    />
  )
}
