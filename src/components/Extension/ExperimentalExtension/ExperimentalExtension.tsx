import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'
import { RequestVideoVisit } from './actions'

import { ActionKey } from './types'
import type { ExtensionActivityRecord } from '../types'

interface ExperimentalExtensionProps {
  activityDetails: ExtensionActivityRecord
}

export const ExperimentalExtension: FC<ExperimentalExtensionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case ActionKey.REQUEST_VIDEO_VISIT:
      return <RequestVideoVisit activityDetails={activityDetails} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

ExperimentalExtension.displayName = 'ExperimentalExtension'
