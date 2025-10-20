import classes from './invalidSessionPage.module.css'
import { FC, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import * as Sentry from '@sentry/nextjs'

interface InvalidSessionPageProps {
  sessionId?: string
  errorType?: 'unauthorized' | 'not_found' | 'expired'
}

export const InvalidSessionPage: FC<InvalidSessionPageProps> = ({
  sessionId,
  errorType = 'unauthorized',
}): JSX.Element => {
  const { t } = useTranslation()

  useEffect(() => {
    // Track invalid session page view in Sentry
    Sentry.captureMessage('Invalid Session Page Viewed', {
      level: 'warning',
      tags: {
        page: 'invalid_session',
        session: sessionId,
        error_type: errorType,
      },
      contexts: {
        page: {
          name: 'InvalidSessionPage',
          sessionId: sessionId,
          errorType: errorType,
          url: window?.location?.href,
        },
      },
    })
  }, [sessionId, errorType])

  const getTitle = () => {
    switch (errorType) {
      case 'unauthorized':
        return t('session.unauthorized_title')
      case 'not_found':
        return t('session.not_found_title')
      case 'expired':
        return t('session.expired_title')
      default:
        return t('session.invalid_session_title')
    }
  }

  const getDescription = () => {
    switch (errorType) {
      case 'unauthorized':
        return t('session.unauthorized_description')
      case 'not_found':
        return t('session.not_found_description')
      case 'expired':
        return t('session.expired_description')
      default:
        return t('session.invalid_session_description')
    }
  }

  return (
    <div className={classes.error_page}>
      <div className={classes.error_page_content}>
        <div className={classes.error_icon_container}>
          <div className={classes.error_icon_shadow}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className={classes.error_icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          </div>
        </div>

        <div className={classes.error_text}>{getTitle()}</div>

        <div className={classes.error_description}>{getDescription()}</div>

        {sessionId && (
          <div className={classes.session_info}>
            <span className={classes.session_label}>
              {t('session.session_id')}:
            </span>{' '}
            <span className={classes.session_id}>{sessionId}</span>
          </div>
        )}
      </div>
    </div>
  )
}
