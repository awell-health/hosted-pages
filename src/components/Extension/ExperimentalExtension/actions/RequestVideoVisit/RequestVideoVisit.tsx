import React, { FC, useCallback, useMemo } from 'react'
import classes from './RequestVideoVisit.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useRequestVideoVisit } from './hooks/useRequestVideoVisit'
import { Button } from '@awell-health/ui-library'
import { mapActionFieldsToObject } from '../../../utils'
import { RequestVideoVisitActionFields } from '../../types'
import { isEmpty } from 'lodash'

interface RequestVideoVisitProps {
  activityDetails: ExtensionActivityRecord
}

export const RequestVideoVisit: FC<RequestVideoVisitProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { onSubmit } = useRequestVideoVisit()

  const { deepLink } = useMemo(
    () => mapActionFieldsToObject<RequestVideoVisitActionFields>(fields),
    [fields]
  )

  const onClick = useCallback(
    (requestVideoVisit: boolean) => {
      onSubmit({ activityId: activity_id, requestVideoVisit })
    },
    [activity_id, onSubmit]
  )

  return (
    <div>
      <div className={classes.container}>
        <p>Whatever content we want here and full control over UI</p>
        {!isEmpty(deepLink) && (
          <a href={deepLink} title="Deep link">
            Test deep link
          </a>
        )}
      </div>
      <div className={classes.container}>
        <Button onClick={() => onClick(false)}>Continue</Button>
        <Button onClick={() => onClick(true)}>Request video visit</Button>
      </div>
    </div>
  )
}

RequestVideoVisit.displayName = 'RequestVideoVisit'
