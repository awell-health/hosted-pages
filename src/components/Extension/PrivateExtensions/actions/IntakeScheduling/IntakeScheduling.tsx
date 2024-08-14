import React, { FC, useCallback, useMemo } from 'react'

import type { ExtensionActivityRecord } from '../../../types'
import { useIntakeScheduling } from './hooks/useIntakeScheduling'
import { mapActionFieldsToObject } from '../../../utils'
import { ActionFields } from './types'

interface IntakeSchedulingProps {
  activityDetails: ExtensionActivityRecord
}

export const IntakeScheduling: FC<IntakeSchedulingProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { onSubmit } = useIntakeScheduling()

  const { patientName, patientEmail } = useMemo(
    () => mapActionFieldsToObject<ActionFields>(fields),
    [fields]
  )

  const handleSubmit = useCallback(() => {
    onSubmit({
      activityId: activity_id,
      eventId: 'something hard coded',
    })
  }, [activity_id, onSubmit])

  return <div>Hello</div>
}

IntakeScheduling.displayName = 'IntakeScheduling'
