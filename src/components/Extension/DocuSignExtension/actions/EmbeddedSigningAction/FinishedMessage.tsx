import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'
import { Button } from '@awell-health/ui-library'
import { DocuSignEvent } from '../../types'
import { LoadingPage } from '../../../../LoadingPage'

interface FinishedMessage {
  event: DocuSignEvent
  finishSigning: (args: { signed: boolean }) => void
}

export const FinishedMessage: FC<FinishedMessage> = ({
  event,
  finishSigning,
}) => {
  const { t } = useTranslation()

  const finishAndFailSigning = () => {
    finishSigning({ signed: false })
  }

  switch (event) {
    case DocuSignEvent.SIGNING_COMPLETE:
      return (
        <LoadingPage title={t('activities.docu_sign.finished_sign_document')} />
      )
    case DocuSignEvent.TTL_EXPIRED:
      return (
        <>
          <span>
            <h2>{t('activities.docu_sign.expired_sign_document')}</h2>
            <Button onClick={finishAndFailSigning}>
              {t('activities.cta_done')}
            </Button>
          </span>
        </>
      )
    default:
      return (
        <>
          <span>
            <h2>{t('activities.docu_sign.failed_sign_document')}</h2>
            <Button onClick={finishAndFailSigning}>
              {t('activities.cta_done')}
            </Button>
          </span>
        </>
      )
  }
}

FinishedMessage.displayName = 'FinishedMessage'
