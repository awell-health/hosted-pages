import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'
import { CompleteFlowAction } from './actions'

import { ActionKey } from './types'
import type { ExtensionActivityRecord } from '../types'

interface FormsortExtensionProps {
  activityDetails: ExtensionActivityRecord
}

export const FormsortExtension: FC<FormsortExtensionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case ActionKey.COMPLETE_FLOW:
      return <CompleteFlowAction activityDetails={activityDetails} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

FormsortExtension.displayName = 'FormsortExtension'
