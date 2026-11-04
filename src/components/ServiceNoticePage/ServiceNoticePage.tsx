import classes from './serviceNoticePage.module.css'
import { FC, useEffect } from 'react'
import { Button } from '@awell-health/ui-library'
import { useTranslation } from 'next-i18next'
import * as Sentry from '@sentry/nextjs'
import {
  ServiceNoticeCopy,
  ServiceNoticeTemplate,
} from '../../services/serviceNotice'
import { LogEvent } from '../../utils/logging'

interface ServiceNoticePageProps {
  template: ServiceNoticeTemplate
  /** Incident-specific wording for this locale; overrides the template. */
  message?: ServiceNoticeCopy
}

export const ServiceNoticePage: FC<ServiceNoticePageProps> = ({
  template,
  message,
}): JSX.Element => {
  const { t } = useTranslation()
  const title = message?.title ?? t(`service_notice.${template}.title`)
  const description =
    message?.description ?? t(`service_notice.${template}.description`)

  useEffect(() => {
    Sentry.logger?.info('Service notice page viewed', {
      event_type: LogEvent.SERVICE_NOTICE_SHOWN,
      template,
      has_custom_message: Boolean(message),
      url: window?.location?.href,
    })
  }, [template, message])

  return (
    <div className={classes.notice_page}>
      <div className={classes.notice_page_content}>
        <div className={classes.notice_icon_container}>
          <div className={classes.notice_icon_shadow}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={classes.notice_icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        <div className={classes.notice_title}>{title}</div>

        <div className={classes.notice_description}>{description}</div>

        {/* The URL is the patient's original one, so a reload resumes the
            session once the notice is switched off. */}
        <div className={classes.retry_btn}>
          <Button
            data-cy="serviceNoticeRetryButton"
            onClick={() => window.location.reload()}
          >
            {t('session.retry')}
          </Button>
        </div>
      </div>
    </div>
  )
}
