import React, { FC, useMemo } from 'react'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import HelloSign from 'hellosign-embedded'

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

  const client = new HelloSign({
    clientId,
  })

  client.on('sign', () => {
    onSubmit(activity_id)
  })

  const startSigning = (signingUrl: string) => {
    client.open(signingUrl, {
      allowCancel: false,
      skipDomainVerification: true,
    })
  }

  const isSignUrlExpired = isAfter(new Date(), new Date(expiresAt))

  return (
    <div>
      {isSignUrlExpired ? (
        <div>
          <p>The sign URL for this signature request is expired.</p>
          <Button onClick={() => onSubmit(activity_id)}>Continue</Button>
        </div>
      ) : (
        <Button onClick={() => startSigning(signUrl)}>Sign document</Button>
      )}
    </div>
  )
}

EmbeddedSigningAction.displayName = 'EmbeddedSigningAction'
