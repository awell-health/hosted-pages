import React, { FC, useMemo } from 'react'
import { mapActionFieldsToObject } from '../../../utils'
import EmbedFlow from '@formsort/react-embed'

import type { CompleteFlowFields } from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useCompleteCompleteFlowAppointment } from './hooks/useCompleteCompleteFlowAction'

interface CompleteFlowActionActionProps {
  activityDetails: ExtensionActivityRecord
}

export const CompleteFlowAction: FC<CompleteFlowActionActionProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { onSubmit } = useCompleteCompleteFlowAppointment()

  const { clientLabel, flowLabel, variantLabel } = useMemo(
    () => mapActionFieldsToObject<CompleteFlowFields>(fields),
    [fields]
  )

  return (
    <div>
      <EmbedFlow
        clientLabel={clientLabel}
        flowLabel={flowLabel}
        variantLabel={variantLabel}
        embedConfig={{
          style: {
            width: '100%',
            height: '100%',
          },
        }}
        onFlowFinalized={(answers) => {
          console.log(answers)
          onSubmit(activity_id)
        }}
      />
    </div>
  )
}

CompleteFlowAction.displayName = 'CompleteFlowAction'
