import React, { FC, useCallback, useMemo, useState } from 'react'
import classes from './DobCheck.module.css'
import activityClasses from '../../../../../../styles/ActivityLayout.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useDobCheck } from './hooks/useDobCheck'
import {
  Button,
  CircularSpinner,
  HostedPageFooter,
  InputField,
} from '@awell-health/ui-library'
import { isEmpty } from 'lodash'
import { mapActionFieldsToObject } from '../../../utils'
import { DobCheckActionFields } from './types'
import { useTranslation } from 'next-i18next'

interface DobCheckProps {
  activityDetails: ExtensionActivityRecord
}

export const DobCheck: FC<DobCheckProps> = ({ activityDetails }) => {
  const { t } = useTranslation()

  const [dobValue, setDobValue] = useState('')
  const [loading, setLoading] = useState(false)
  const { activity_id, fields } = activityDetails

  const { onSubmit } = useDobCheck()

  const { label } = useMemo(
    () => mapActionFieldsToObject<DobCheckActionFields>(fields),
    [fields]
  )

  const handleActivityCompletion = useCallback(() => {
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
      setLoading(true)
      const response = await fetch('/api/identity/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dob: dobValue }),
      })

      setLoading(false)

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
      handleActivityCompletion()
    } catch (error) {
      console.error('Error checking dob:', error)
      throw error
    }
  }, [dobValue, handleActivityCompletion])

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
            {/* We should prettify the loading state */}
            {loading ? (
              <CircularSpinner size="sm" />
            ) : (
              <InputField
                id="name"
                label={
                  label ?? t('activities.identity_verification.default_label')
                }
                type="date"
                value={dobValue}
                onChange={(e) => setDobValue(e.target.value)}
              />
            )}
          </div>
        </div>
      </main>
      <HostedPageFooter showScrollHint={false}>
        <div
          className={`${activityClasses.button_wrapper} ${classes.container}`}
        >
          <Button variant="primary" onClick={handleDobCheck} disabled={loading}>
            {t('activities.identity_verification.cta')}
          </Button>
        </div>
      </HostedPageFooter>
    </>
  )
}

DobCheck.displayName = 'DobCheck'
