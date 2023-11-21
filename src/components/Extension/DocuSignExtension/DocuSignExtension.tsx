import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'
import { ErrorPage } from '../../ErrorPage'
import { EmbeddedSigningAction } from './actions'
import { ActionKey } from './types'
import type { ExtensionActivityRecord } from '../types'

interface DocuSignExtensionProps {
  activityDetails: ExtensionActivityRecord
}

export const DocuSignExtension: FC<DocuSignExtensionProps> = ({
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

DocuSignExtension.displayName = 'DropboxSignExtension'
