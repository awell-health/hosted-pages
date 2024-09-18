import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import classes from './ReviewMedicationExtraction.module.css'
import activityClasses from '../../../../../../styles/ActivityLayout.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useReviewMedicationExtraction } from './hooks/useReviewMedicationExtraction'
import {
  Button,
  HostedPageFooter,
  InputField,
  useTheme,
} from '@awell-health/ui-library'
import { isEmpty } from 'lodash'
import { mapActionFieldsToObject } from '../../../utils'
import { ActionFields } from './types'
import Image from 'next/image'

interface ReviewMedicationExtractionProps {
  activityDetails: ExtensionActivityRecord
}

type ExtractedMedicationData = {
  medications: Array<{
    extracted_medication_name: string
    extracted_brand_name: string
    extracted_dosage: string
    dose_form_name: string
  }>
}

type Medication = {
  name: string
  brand_name: string
  dose: string
  dose_form_name?: string
}

export const ReviewMedicationExtraction: FC<
  ReviewMedicationExtractionProps
> = ({ activityDetails }) => {
  const [medications, setMedications] = useState<Medication[]>([])
  const { activity_id, fields } = activityDetails
  const { updateLayoutMode, resetLayoutMode } = useTheme()
  const { onSubmit } = useReviewMedicationExtraction()

  const { imageUrl, medicationData } = useMemo(
    () => mapActionFieldsToObject<ActionFields>(fields),
    [fields]
  )

  useEffect(() => {
    if (medicationData) {
      const parsedMedicationData: ExtractedMedicationData =
        JSON.parse(medicationData)

      const mappedMedications = parsedMedicationData?.medications.map(
        (medication) => {
          return {
            name: medication.extracted_medication_name,
            brand_name: medication.extracted_brand_name,
            dose: medication.extracted_dosage,
            dose_form_name: medication.dose_form_name,
          }
        }
      )
      setMedications(mappedMedications)
    }
  }, [])

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
        !isEmpty(medication.dose_form_name) ||
        !isEmpty(medication.brand_name)
      )
    })

    onSubmit({
      activityId: activity_id,
      validatedData: JSON.stringify({ medications: filteredMedications }),
    })
  }, [activity_id, onSubmit, medications])

  const addMedication = () => {
    setMedications([
      ...medications,
      { name: '', dose: '', dose_form_name: '', brand_name: '' },
    ])
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
                id="brand_name"
                label="Brand name"
                type="text"
                value={medication.brand_name || ''}
                onChange={(e) =>
                  updateMedication(index, 'brand_name', e.target.value)
                }
                placeholder="Brand name"
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
                id="dose_form_name"
                label="Dose form name"
                type="text"
                value={medication.dose_form_name || ''}
                onChange={(e) =>
                  updateMedication(index, 'dose_form_name', e.target.value)
                }
                placeholder="Dose form name"
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
