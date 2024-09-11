import React, { FC, useMemo, useState } from 'react'
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
import { mapActionFieldsToObject } from '../../../utils'
import { DobCheckActionFields } from './types'
import { useTranslation } from 'next-i18next'

interface DobCheckProps {
  activityDetails: ExtensionActivityRecord
}

export const DobCheck: FC<DobCheckProps> = ({ activityDetails }) => {
  const { t } = useTranslation()

  const [dobValue, setDobValue] = useState('')
  const { activity_id, fields, pathway_id } = activityDetails

  const { loading, onSubmit } = useDobCheck({
    pathway_id,
    activity_id,
  })

  const { label } = useMemo(
    () => mapActionFieldsToObject<DobCheckActionFields>(fields),
    [fields]
  )

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
          <Button
            variant="primary"
            onClick={() => onSubmit(dobValue)}
            disabled={loading}
          >
            {t('activities.identity_verification.cta')}
          </Button>
        </div>
      </HostedPageFooter>
    </>
  )
}

DobCheck.displayName = 'DobCheck'
