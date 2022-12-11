import React from 'react'
import Image from 'next/image'
import { Message as MessageViewer } from '@awell_health/ui-library'
import { useTranslation } from 'next-i18next'
import { useMessage, Activity } from '../../hooks/useMessage'
import { LoadingPage } from '../LoadingPage'
import { ErrorPage } from '../ErrorPage'
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
    return <LoadingPage title={t('activities.message.loading')} />
  }

  if (error || !message) {
    return <ErrorPage title={t('activities.message.loading_error')} />
  }

  return (
    <>
      <MessageViewer
        format={message.format}
        content={message.body}
        subject={message.subject}
        attachments={message.attachments || []}
        attachmentIcon={
          <Image src={attachmentIcon} alt="" width={20} height={20} />
        }
        attachmentLabels={{
          video: t('activities.message.open_video_attachment'),
          link: t('activities.message.open_link_attachment'),
          file: t('activities.message.download_file_attachment'),
        }}
        onMessageRead={() => onRead()}
        buttonLabels={{ readMessage: t('activities.message.cta_mark_as_read') }}
      />
    </>
  )
}
