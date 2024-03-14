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
        <div>
          <p>Whatever content we want here and full control over UI</p>
          <ul>
            {!isEmpty(deepLink) && (
              <li>
                <a href={deepLink} title="Deep link">
                  Test deep link
                </a>
              </li>
            )}
            <li>
              <a href="https://awellhealth.com" title="Link to Awell website">
                Link to Awell website
              </a>
            </li>
            <li>
              <a
                href="awelltestapp://careflows"
                title="Deep link to Awell test app"
              >
                Deep link to Awell test app
              </a>
            </li>
            <li>
              <a href="messages://" title="Deep link to messages app">
                Deep link to messages app
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className={classes.container}>
        <Button onClick={() => onClick(false)}>Continue</Button>
        <Button onClick={() => onClick(true)}>Request video visit</Button>
      </div>
    </div>
  )
}

RequestVideoVisit.displayName = 'RequestVideoVisit'
