import React, { FC, useCallback } from 'react'
import classes from './RequestVideoVisit.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useRequestVideoVisit } from './hooks/useRequestVideoVisit'
import { Button } from '@awell-health/ui-library'

interface RequestVideoVisitProps {
  activityDetails: ExtensionActivityRecord
}

export const RequestVideoVisit: FC<RequestVideoVisitProps> = ({
  activityDetails,
}) => {
  const { activity_id } = activityDetails
  const { onSubmit } = useRequestVideoVisit()

  const onClick = useCallback(
    (requestVideoVisit: boolean) => {
      onSubmit({ activityId: activity_id, requestVideoVisit })
    },
    [activity_id, onSubmit]
  )

  return (
    <div className={classes.container}>
      <Button onClick={() => onClick(false)}>Continue</Button>
      <Button onClick={() => onClick(true)}>Request video visit</Button>
    </div>
  )
}

RequestVideoVisit.displayName = 'RequestVideoVisit'
