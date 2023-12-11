import React, { FC, useMemo } from 'react'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'

import { type EmbeddedSigningFields, validateSettings } from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useCompleteEmbeddedSigningAction } from './hooks/useCompleteEmbeddedSigningAction'
import { Button } from '@awell-health/ui-library'
import { isAfter } from 'date-fns'
import he from 'he'
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

  /**
   * This is needed because Orchestration seems to encode string action field values
   * - Data point value: https://url.com/?signature_id=ABC&token=DEF
   * - Action field value https://url.com/?signature_id&#x3D;ABC&amp;token&#x3D;DEF
   *
   * We need the decoded action field value and he library helps us to force decode
   * the url to a valid one.
   */
  const decodedSignUrl = he.decode(signUrl)

  const settingsData = useMemo(() => mapSettingsToObject(settings), [settings])

  const { testMode, clientId } = validateSettings(settingsData)

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
        client.open(decodedSignUrl, {
          allowCancel: true,
          testMode,
          debug: testMode,
          skipDomainVerification: true,
        })

        /*
         ! Needs handling of all events; currently only `sign` event is handled
         ! https://github.com/hellosign/hellosign-embedded/wiki/API-Documentation-(v2)#events
         */
        client.on('sign', () => {
          onSubmit(activity_id, { signed: true })
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
          <Button onClick={() => onSubmit(activity_id, { signed: false })}>
            Continue
          </Button>
        </div>
      ) : (
        <Button onClick={singDocument}>Sign document</Button>
      )}
    </div>
  )
}

EmbeddedSigningAction.displayName = 'EmbeddedSigningAction'
