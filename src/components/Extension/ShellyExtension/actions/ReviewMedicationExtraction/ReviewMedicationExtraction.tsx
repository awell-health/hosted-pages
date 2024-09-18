import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import classes from './ReviewMedicationExtraction.module.css'
import activityClasses from '../../../../../../styles/ActivityLayout.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useReviewMedicationExtraction } from './hooks/useReviewMedicationExtraction'
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
import Image from 'next/image'

interface ReviewMedicationExtractionProps {
  activityDetails: ExtensionActivityRecord
}

type Medication = {
  name: string
  dose: string
  instructions?: string
}

export const ReviewMedicationExtraction: FC<
  ReviewMedicationExtractionProps
> = ({ activityDetails }) => {
  const [medications, setMedications] = useState<Medication[]>([])
  const { activity_id, fields } = activityDetails
  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { onSubmit } = useReviewMedicationExtraction()

  const { imageUrl } = useMemo(
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
      validatedData: JSON.stringify({ medications: filteredMedications }),
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
          {imageUrl && (
            <div className={classes.image}>
              <Image
                layout="responsive"
                alt="medication-image"
                src={imageUrl}
                width={800} // Set a default width
                height={600} // Set a default height to maintain aspect ratio
                sizes="(max-width: 768px) 100vw, 
             (max-width: 1200px) 50vw, 
             33vw" // Specify sizes based on viewport width
                objectFit="contain" // Ensures the image fits within its container
                objectPosition="center" // Centers the image
              />
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
      <HostedPageFooter showScrollHint={false}>
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

ReviewMedicationExtraction.displayName = 'ReviewMedicationExtraction'
