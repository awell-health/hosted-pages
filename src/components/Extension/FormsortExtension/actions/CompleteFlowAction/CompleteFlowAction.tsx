import React, { FC, useMemo } from 'react'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import EmbedFlow from '@formsort/react-embed'
import classes from './completeFlowAction.module.css'

import type { CompleteFlowFields, FormsortExtensionSettings } from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useCompleteCompleteFlowAppointment } from './hooks/useCompleteCompleteFlowAction'

interface CompleteFlowActionActionProps {
  activityDetails: ExtensionActivityRecord
}

export const CompleteFlowAction: FC<CompleteFlowActionActionProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields, settings } = activityDetails
  const { onSubmit } = useCompleteCompleteFlowAppointment()

  const { clientLabel, flowLabel, variantLabel } = useMemo(
    () => mapActionFieldsToObject<CompleteFlowFields>(fields),
    [fields]
  )

  const { environment } = useMemo(
    () => mapSettingsToObject<FormsortExtensionSettings>(settings),
    [fields]
  )

  return (
    <div className={classes.container}>
      <EmbedFlow
        clientLabel={clientLabel}
        flowLabel={flowLabel}
        variantLabel={variantLabel}
        formsortEnv={environment}
        embedConfig={{
          style: {
            width: '100%',
            height: '100%',
          },
        }}
        onFlowFinalized={(answers) => {
          onSubmit(activity_id)
        }}
      />
    </div>
  )
}

CompleteFlowAction.displayName = 'CompleteFlowAction'
