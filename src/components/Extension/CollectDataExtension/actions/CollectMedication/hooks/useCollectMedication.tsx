import { useCallback, ComponentProps } from 'react'
import { DataPoints, useCompleteExtensionActivity } from '../../../types'
import { CollectMedication as CollectMedicationComponent } from '@awell-health/ui-library'
import { isEmpty } from 'lodash'

type MedicationData = Parameters<
  ComponentProps<typeof CollectMedicationComponent>['onSubmit']
>[0]

export const useCollectMedication = () => {
  const { isSubmitting, onSubmit: _onSubmit } = useCompleteExtensionActivity()

  const onSubmit = useCallback(
    async ({
      activityId,
      medicationData,
    }: {
      activityId: string
      medicationData: MedicationData
    }) => {
      const prettyMedicationData = medicationData
        .map((medication) => {
          const parts = [medication.name]
          if (!isEmpty(medication.dose)) parts.push(medication.dose)
          if (
            !isEmpty(medication.instructions) &&
            medication.instructions !== undefined
          )
            parts.push(medication.instructions)

          return parts.join('; ')
        })
        .join('\n')

      const dataPoints: DataPoints = [
        { key: 'medicationData', value: JSON.stringify(medicationData) }, // JSON data point value type
        { key: 'medicationDataString', value: JSON.stringify(medicationData) }, // String data point value type
        { key: 'prettyMedicationData', value: prettyMedicationData },
      ]

      return _onSubmit(activityId, dataPoints)
    },
    [_onSubmit]
  )

  return {
    isSubmitting,
    onSubmit,
  }
}
