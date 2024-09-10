import React, { FC, useCallback, useState } from 'react'
import classes from './DobCheck.module.css'
import activityClasses from '../../../../../../styles/ActivityLayout.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useDobCheck } from './hooks/useDobCheck'
import { Button, HostedPageFooter, InputField } from '@awell-health/ui-library'
import { isEmpty } from 'lodash'

interface DobCheckProps {
  activityDetails: ExtensionActivityRecord
}

export const DobCheck: FC<DobCheckProps> = ({ activityDetails }) => {
  const [dobValue, setDobValue] = useState('')
  const { activity_id } = activityDetails

  const { onSubmit } = useDobCheck()

  const handleSubmit = useCallback(() => {
    onSubmit({
      activityId: activity_id,
      success: true, // extension data point
    })
  }, [activity_id, onSubmit])

  const handleDobCheck = useCallback(async () => {
    if (isEmpty(dobValue)) {
      // Prettify this later
      alert('Please enter a date of birth')
      return
    }

    try {
      const response = await fetch('/api/identity/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dob: dobValue }),
      })

      if (!response.ok) {
        throw new Error('Failed to check dob')
      }

      const jsonRes = await response.json()

      if (!jsonRes?.success) {
        // Prettify this later
        alert('No match')
        return
      }

      alert('Match!') // should be removed
      handleSubmit() // commented out for testing purposes but it works
    } catch (error) {
      console.error('Error checking dob:', error)
      throw error
    }
  }, [dobValue, handleSubmit])

  return (
    <>
      <main
        id="ahp_main_content_with_scroll_hint"
        className={activityClasses.main_content}
      >
        <div
          className={`${classes.container} ${classes.groupMedsListContainer}`}
        >
          <div className={classes.inputWrapper}>
            <InputField
              id="name"
              label="Enter your date of birth to verify your identity"
              type="date"
              value={dobValue}
              onChange={(e) => setDobValue(e.target.value)}
              placeholder="Medication Name"
            />
          </div>
        </div>
      </main>
      <HostedPageFooter showScrollHint={false}>
        <div
          className={`${activityClasses.button_wrapper} ${classes.container}`}
        >
          <Button variant="primary" onClick={handleDobCheck}>
            Confirm
          </Button>
        </div>
      </HostedPageFooter>
    </>
  )
}

DobCheck.displayName = 'DobCheck'
