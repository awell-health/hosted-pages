import React from 'react'
import Image from 'next/image'
import { Message as MessageViewer, Button } from '@awell_health/ui-library'
import { useTranslation } from 'next-i18next'
import { useMessage, Activity } from '../../hooks/useMessage'
import { LoadingPage } from '../LoadingPage'
import { ErrorPage } from '../ErrorPage'
import classes from './message.module.css'
import attachmentIcon from './../../assets/link.svg'
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

  if (error || !message) {
    return <ErrorPage title={t('message_loading_error')} />
  }

  return (
    <MessageViewer
      format={message.format}
      content={message.body}
      subject={message.subject}
      attachments={message.attachments || []}
      attachmentIcon={
        <Image src={attachmentIcon} alt="" width={20} height={20} />
      }
      attachmentLabels={{
        video: t('open_video'),
        link: t('open_link'),
        file: t('download'),
      }}
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
