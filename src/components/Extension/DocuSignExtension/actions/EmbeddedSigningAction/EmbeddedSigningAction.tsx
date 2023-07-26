import React, { FC, useMemo, useState } from 'react'
import { mapActionFieldsToObject } from '../../../utils'
import { type EmbeddedSigningFields } from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useCompleteEmbeddedSigningAction } from './hooks/useCompleteEmbeddedSigningAction'
import { Button } from '@awell_health/ui-library'
import he from 'he'
import { useTranslation } from 'next-i18next'

interface EmbeddedSigningActionActionProps {
  activityDetails: ExtensionActivityRecord
}

export const EmbeddedSigningAction: FC<EmbeddedSigningActionActionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()
  const { activity_id, fields } = activityDetails
  const { onSubmit } = useCompleteEmbeddedSigningAction()

  const [isSignProcess, setIsSignProcess] = useState(false)

  const { signUrl } = useMemo(
    () => mapActionFieldsToObject<EmbeddedSigningFields>(fields),
    [fields]
  )

  /**
   * This is needed because Orchestration seems to encode string action field values
   * - Data point value: https://url.com/?signature_id=ABC&token=DEF
   * - Action field value https://url.com/?signature_id&#x3D;ABC&amp;token&#x3D;DEF
   *
   * We need the decoded action field value and he library helps us to force decode
   * the url to a valid one.
   */
  const decodedSignUrl = he.decode(signUrl)

  const finishSigning = () => {
    onSubmit(activity_id)
  }

  const beginSigning = () => {
    setIsSignProcess(true)
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '12px 0 0 0',
      }}
    >
      {!isSignProcess && (
        <Button onClick={beginSigning}>
          {t('activities.docu_sign.cta_sign_document')}
        </Button>
      )}
      {isSignProcess && <iframe src={decodedSignUrl} />}
    </div>
  )
}

EmbeddedSigningAction.displayName = 'EmbeddedSigningAction'
