import React, { FC, useState } from 'react'
import { useTranslation } from 'next-i18next'
import { Button } from '@awell_health/ui-library'
import classes from './embeddedSigning.module.css'
import { LoadingPage } from '../../../../LoadingPage'

interface SigningProcess {
  signUrl: string
  isIframeLoaded: boolean
  setIsIframeLoaded: (isLoaded: boolean) => void
}

export const SigningProcess: FC<SigningProcess> = ({
  signUrl,
  isIframeLoaded,
  setIsIframeLoaded,
}) => {
  const { t } = useTranslation()

  const [isSignProcess, setIsSignProcess] = useState(false)

  const beginSigning = () => {
    setIsSignProcess(true)
  }

  if (isSignProcess) {
    return (
      <>
        {!isIframeLoaded && (
          <LoadingPage
            title={t('activities.docu_sign.loading_sign_document')}
          />
        )}
        <iframe
          className={
            isIframeLoaded
              ? classes['iframe-loaded']
              : classes['iframe-loading']
          }
          src={signUrl}
          onLoad={() => {
            setIsIframeLoaded(true)
          }}
        />
      </>
    )
  }

  return (
    <span>
      <Button onClick={beginSigning}>
        {t('activities.docu_sign.cta_sign_document')}
      </Button>
    </span>
  )
}

SigningProcess.displayName = 'SigningProcess'
