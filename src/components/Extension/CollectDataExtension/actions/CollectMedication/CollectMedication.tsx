import React, { ComponentProps, FC, useCallback, useMemo } from 'react'

import type { ExtensionActivityRecord } from '../../../types'
import { useCollectMedication } from './hooks/useCollectMedication'
import { CollectMedication as CollectMedicationComponent } from '@awell-health/ui-library'
import { useTranslation } from 'next-i18next'
import { mapActionFieldsToObject } from '../../../utils'
import { CollectMedicationActionFields } from '../../types'

interface CollectMedicationProps {
  activityDetails: ExtensionActivityRecord
}

export const CollectMedication: FC<CollectMedicationProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { onSubmit } = useCollectMedication()
  const { t } = useTranslation()

  const { label } = useMemo(
    () => mapActionFieldsToObject<CollectMedicationActionFields>(fields),
    [fields]
  )

  const handleSubmit: ComponentProps<
    typeof CollectMedicationComponent
  >['onSubmit'] = useCallback(
    (medications) => {
      onSubmit({
        activityId: activity_id,
        medicationDataAsJson: JSON.stringify(medications),
      })
    },
    [activity_id, onSubmit]
  )

  return (
    <CollectMedicationComponent
      onSubmit={handleSubmit}
      label={label}
      text={{
        medication_name: t('activities.collect_medication.medication_name'),
        medication_dose: t('activities.collect_medication.medication_dose'),
        medication_instructions: t(
          'activities.collect_medication.medication_instructions'
        ),
        add_medication_button: t(
          'activities.collect_medication.add_medication_button'
        ),
        submit_medication: t('activities.collect_medication.submit_button'),
      }}
    />
  )
}

CollectMedication.displayName = 'CollectMedication'
