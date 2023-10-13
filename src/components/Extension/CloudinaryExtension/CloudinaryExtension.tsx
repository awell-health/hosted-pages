import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'
import { UploadFilesAction, UploadSingleFileAction } from './actions'

import { ActionKey } from './types'
import type { Activity, ExtensionActivityRecord } from '../types'

interface CloudinaryExtensionProps {
  activity: Activity
  activityDetails: ExtensionActivityRecord
}

export const CloudinaryExtension: FC<CloudinaryExtensionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case ActionKey.UPLOAD_FILES:
      return <UploadFilesAction activityDetails={activityDetails} />
    case ActionKey.UPLOAD_SINGLE_FILE:
      return <UploadSingleFileAction activityDetails={activityDetails} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

CloudinaryExtension.displayName = 'CloudinaryExtension'
