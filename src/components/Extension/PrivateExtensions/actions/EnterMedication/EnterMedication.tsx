import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import classes from './EnterMedication.module.css'
import activityClasses from '../../../../../../styles/ActivityLayout.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useEnterMedication } from './hooks/useEnterMedication'
import {
  Button,
  HostedPageFooter,
  InputField,
  QuestionLabel,
  useTheme,
} from '@awell-health/ui-library'
import { isEmpty } from 'lodash'
import { mapActionFieldsToObject } from '../../../utils'
import { ActionFields } from './types'
import { useTranslation } from 'next-i18next'

interface EnterMedicationProps {
  activityDetails: ExtensionActivityRecord
}

type Medication = {
  name: string
  dose: string
  instructions?: string
}

export const EnterMedication: FC<EnterMedicationProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()
  const [medications, setMedications] = useState<Medication[]>([])
  const { activity_id, fields } = activityDetails
  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { onSubmit } = useEnterMedication()

  const { questionLabel } = useMemo(
    () => mapActionFieldsToObject<ActionFields>(fields),
    [fields]
  )

  useEffect(() => {
    updateLayoutMode('flexible')

    return () => {
      // Reset to default mode on unmount
      resetLayoutMode()
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const filteredMedications = medications.filter((medication) => {
      return (
        !isEmpty(medication.name) ||
        !isEmpty(medication.dose) ||
        !isEmpty(medication.instructions)
      )
    })

    onSubmit({
      activityId: activity_id,
      stringifiedMedication: JSON.stringify(filteredMedications),
    })
  }, [activity_id, onSubmit, medications])

  const addMedication = () => {
    setMedications([...medications, { name: '', dose: '', instructions: '' }])
  }

  const updateMedication = (
    index: number,
    field: keyof Medication,
    value: string
  ) => {
    const newMedications = [...medications]
    newMedications[index] = { ...newMedications[index], [field]: value }
    setMedications(newMedications)
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  return (
    <>
      <main
        id="ahp_main_content_with_scroll_hint"
        className={activityClasses.main_content}
      >
        <div
          className={`${classes.container} ${classes.groupMedsListContainer}`}
        >
          {questionLabel && (
            <div className={classes.label}>
              <QuestionLabel label={questionLabel} />
            </div>
          )}
          {medications.map((medication, index) => (
            <div className={classes.singleMedsListContainer} key={index}>
              <InputField
                id="name"
                label={t('activities.collect_medication.medication_name')}
                type="text"
                value={medication.name}
                onChange={(e) =>
                  updateMedication(index, 'name', e.target.value)
                }
                placeholder={t('activities.collect_medication.medication_name')}
              />
              <InputField
                id="dose"
                label={t('activities.collect_medication.medication_dose')}
                type="text"
                value={medication.dose}
                onChange={(e) =>
                  updateMedication(index, 'dose', e.target.value)
                }
                placeholder={t('activities.collect_medication.medication_dose')}
              />
              <InputField
                id="instructions"
                label={t(
                  'activities.collect_medication.medication_instructions'
                )}
                type="text"
                value={medication.instructions || ''}
                onChange={(e) =>
                  updateMedication(index, 'instructions', e.target.value)
                }
                placeholder={t(
                  'activities.collect_medication.medication_instructions'
                )}
              />
              <Button
                variant="tertiary"
                onClick={() => removeMedication(index)}
              >
                ✕
              </Button>
            </div>
          ))}
        </div>
        <div className={`${classes.container} ${classes.addMedsButton}`}>
          <Button onClick={addMedication} variant="secondary">
            {t('activities.collect_medication.add_medication_button')}
          </Button>
        </div>
      </main>
      <HostedPageFooter hideScrollHint={true}>
        <div
          className={`${activityClasses.button_wrapper} ${classes.container}`}
        >
          <Button variant="primary" onClick={handleSubmit}>
            {t('activities.collect_medication.submit_button')}
          </Button>
        </div>
      </HostedPageFooter>
    </>
  )
}

EnterMedication.displayName = 'EnterMedication'
