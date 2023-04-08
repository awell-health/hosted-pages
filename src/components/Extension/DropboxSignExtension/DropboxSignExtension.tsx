import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'
import { EmbeddedSigningAction } from './actions'

import { ActionKey } from './types'
import type { Activity, ExtensionActivityRecord } from '../types'

interface DropboxSignExtensionProps {
  activity: Activity
  activityDetails: ExtensionActivityRecord
}

export const DropboxSignExtension: FC<DropboxSignExtensionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case ActionKey.EMBEDDED_SIGNING:
      return <EmbeddedSigningAction activityDetails={activityDetails} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

DropboxSignExtension.displayName = 'DropboxSignExtension'
