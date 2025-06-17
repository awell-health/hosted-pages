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
          {!questionLabel && (
            <div className={classes.label}>
              <QuestionLabel label="Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum." />
            </div>
          )}
          {medications.map((medication, index) => (
            <div className={classes.singleMedsListContainer} key={index}>
              <InputField
                id="name"
                label="Name"
                type="text"
                value={medication.name}
                onChange={(e) =>
                  updateMedication(index, 'name', e.target.value)
                }
                placeholder="Medication Name"
              />
              <InputField
                id="dose"
                label="Dose"
                type="text"
                value={medication.dose}
                onChange={(e) =>
                  updateMedication(index, 'dose', e.target.value)
                }
                placeholder="Dose"
              />
              <InputField
                id="instructions"
                label="Instructions"
                type="text"
                value={medication.instructions || ''}
                onChange={(e) =>
                  updateMedication(index, 'instructions', e.target.value)
                }
                placeholder="Instructions"
              />
              <Button
                variant="tertiary"
                onClick={() => removeMedication(index)}
              >
                X
              </Button>
            </div>
          ))}
        </div>
        <div className={`${classes.container} ${classes.addMedsButton}`}>
          <Button onClick={addMedication} variant="secondary">
            Add Medication
          </Button>
        </div>
      </main>
      <HostedPageFooter hideScrollHint={true}>
        <div
          className={`${activityClasses.button_wrapper} ${classes.container}`}
        >
          <Button variant="primary" onClick={handleSubmit}>
            Next
          </Button>
        </div>
      </HostedPageFooter>
    </>
  )
}

EnterMedication.displayName = 'EnterMedication'
