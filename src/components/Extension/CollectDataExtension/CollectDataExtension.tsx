import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'
import { CollectMedication, RemoteSingleSelectAction } from './actions'

import { ActionKey } from './types'
import type { ExtensionActivityRecord } from '../types'

interface CollectDataExtensionProps {
  activityDetails: ExtensionActivityRecord
}

export const CollectDataExtension: FC<CollectDataExtensionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case ActionKey.REMOTE_SINGLE_SELECT:
      return <RemoteSingleSelectAction activityDetails={activityDetails} />
    case ActionKey.COLLECT_MEDICATION:
      return <CollectMedication activityDetails={activityDetails} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

CollectDataExtension.displayName = 'CollectDataExtension'
