import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'
import { ReviewMedicationExtraction } from './actions'

import { ActionKey } from './types'
import type { ExtensionActivityRecord } from '../types'

interface ShellyExtensionProps {
  activityDetails: ExtensionActivityRecord
}

export const ShellyExtension: FC<ShellyExtensionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case ActionKey.REVIEW_MEDICATION_EXTRACTION:
      return <ReviewMedicationExtraction activityDetails={activityDetails} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

ShellyExtension.displayName = 'ShellyExtension'
