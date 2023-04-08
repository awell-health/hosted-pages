import React, { FC, useMemo } from 'react'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'

import type {
  EmbeddedSigningFields,
  DropboxSignExtensionSettings,
} from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useCompleteEmbeddedSigningAction } from './hooks/useCompleteEmbeddedSigningAction'
import { Button } from '@awell_health/ui-library'
import { isAfter } from 'date-fns'

interface EmbeddedSigningActionActionProps {
  activityDetails: ExtensionActivityRecord
}

export const EmbeddedSigningAction: FC<EmbeddedSigningActionActionProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields, settings } = activityDetails
  const { onSubmit } = useCompleteEmbeddedSigningAction()

  const { signUrl, expiresAt } = useMemo(
    () => mapActionFieldsToObject<EmbeddedSigningFields>(fields),
    [fields]
  )

  const { apiKey, clientId, testMode } = useMemo(
    () => mapSettingsToObject<DropboxSignExtensionSettings>(settings),
    [fields]
  )

  console.log(testMode)

  /**
   * https://github.com/vercel/next.js/issues/35559
   */
  const singDocument = () => {
    import('hellosign-embedded')
      .then(({ default: HelloSign }) => {
        return new HelloSign({
          clientId,
        })
      })
      .then((client) => {
        client.open(signUrl, {
          allowCancel: true,
          testMode,
          debug: testMode,
          skipDomainVerification: true,
        })

        client.on('sign', () => {
          onSubmit(activity_id)
        })
      })
  }

  const isSignUrlExpired = isAfter(new Date(), new Date(expiresAt))

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '12px 0 0 0',
      }}
    >
      {isSignUrlExpired ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <p>The sign URL for this signature request is expired.</p>
          <Button onClick={() => onSubmit(activity_id)}>Continue</Button>
        </div>
      ) : (
        <Button onClick={singDocument}>Sign document</Button>
      )}
    </div>
  )
}

EmbeddedSigningAction.displayName = 'EmbeddedSigningAction'
