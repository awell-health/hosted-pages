import classes from './networkErrorPage.module.css'
import { FC, useEffect, useState } from 'react'
import { Button } from '@awell-health/ui-library'
import { useTranslation } from 'next-i18next'
import * as Sentry from '@sentry/nextjs'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'

interface NetworkErrorPageProps {
  onRetry: () => Promise<void>
  sessionId?: string
}

export const NetworkErrorPage: FC<NetworkErrorPageProps> = ({
  onRetry,
  sessionId,
}): JSX.Element => {
  const { t } = useTranslation()
  const [isRetrying, setIsRetrying] = useState(false)

  useEffect(() => {
    // Track network error page view in Sentry
    Sentry.logger?.info('Network Error Page Viewed', {
      page: 'network_error',
      session: sessionId,
      page_name: 'NetworkErrorPage',
      sessionId: sessionId,
      url: window?.location?.href,
    })
  }, [sessionId])

  const handleRetry = async () => {
    setIsRetrying(true)

    Sentry.logger?.info('User clicked retry on network error page', {
      category: 'network',
      sessionId,
    })

    try {
      await onRetry()
      // If retry succeeds, the parent component will handle navigation
    } catch (error) {
      // If retry fails, keep showing the error page
      const hostedSessionError = new HostedSessionError(
        'Retry failed on network error page',
        {
          errorType: 'NETWORK_RETRY_FAILED',
          originalError: error,
          contexts: {
            retry: {
              sessionId,
              message: 'Retry failed on network error page',
            },
          },
        }
      )
      captureHostedSessionError(hostedSessionError)
    } finally {
      setIsRetrying(false)
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
                d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
              />
            </svg>
          </div>
        </div>

        <div className={classes.error_text}>
          {t('session.network_error_title')}
        </div>

        <div className={classes.error_description}>
          {t('session.network_error_description')}
        </div>

        <div className={classes.retry_btn}>
          <Button
            data-cy="retryButton"
            onClick={handleRetry}
            disabled={isRetrying}
          >
            {isRetrying ? t('session.retrying') : t('session.retry')}
          </Button>
        </div>
      </div>
    </div>
  )
}
