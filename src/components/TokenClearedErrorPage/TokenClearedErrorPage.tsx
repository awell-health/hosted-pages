import classes from './tokenClearedErrorPage.module.css'
import { FC, useEffect } from 'react'
import { useTranslation } from 'next-i18next'
import * as Sentry from '@sentry/nextjs'

interface TokenClearedErrorPageProps {
  sessionId?: string
  onResume?: () => void
}

export const TokenClearedErrorPage: FC<TokenClearedErrorPageProps> = ({
  sessionId,
  onResume,
}): JSX.Element => {
  const { t } = useTranslation()

  useEffect(() => {
    // Track token cleared page view in Sentry
    Sentry.logger?.error('Token Cleared Error Page Viewed', {
      category: 'authentication',
      page: 'token_cleared',
      session: sessionId,
      page_name: 'TokenClearedErrorPage',
      sessionId: sessionId,
      url: window?.location?.href,
    })
  }, [sessionId])

  const handleResume = () => {
    if (onResume) {
      onResume()
    } else {
      // Default behavior: reload the page to trigger token re-fetch
      window.location.reload()
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
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
        </div>

        <div className={classes.error_text}>
          {t('session.token_cleared_title')}
        </div>

        <div className={classes.error_description}>
          {t('session.token_cleared_description')}
        </div>

        {sessionId && (
          <div className={classes.session_info}>
            <span className={classes.session_label}>
              {t('session.session_id')}:
            </span>{' '}
            <span className={classes.session_id}>{sessionId}</span>
          </div>
        )}

        <button className={classes.resume_button} onClick={handleResume}>
          {t('session.fetch_new_token')}
        </button>
      </div>
    </div>
  )
}
