import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import classes from './EnterMedication.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useEnterMedication } from './hooks/useEnterMedication'
import { Button, InputField, useTheme } from '@awell-health/ui-library'
import { isEmpty } from 'lodash'
import { mapActionFieldsToObject } from '../../../utils'
import { EnterMedicationActionFields } from '../../types'

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
    () => mapActionFieldsToObject<EnterMedicationActionFields>(fields),
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
    <div>
      <div className={`${classes.container} ${classes.groupMedsListContainer}`}>
        {!isEmpty(questionLabel) && (
          <div dangerouslySetInnerHTML={{ __html: questionLabel ?? '' }} />
        )}
        {medications.map((medication, index) => (
          <div className={classes.singleMedsListContainer} key={index}>
            <InputField
              id="name"
              label="Name"
              type="text"
              value={medication.name}
              onChange={(e) => updateMedication(index, 'name', e.target.value)}
              placeholder="Medication Name"
            />
            <InputField
              id="dose"
              label="Dose"
              type="text"
              value={medication.dose}
              onChange={(e) => updateMedication(index, 'dose', e.target.value)}
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
            <Button variant="tertiary" onClick={() => removeMedication(index)}>
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
      <div className={`${classes.container} ${classes.submitButton}`}>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>
    </div>
  )
}

EnterMedication.displayName = 'EnterMedication'
