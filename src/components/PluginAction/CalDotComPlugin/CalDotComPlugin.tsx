import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'

import type {
  Activity,
  PluginActivityRecord,
} from '../../../types/generated/types-orchestration'
import { CalDotComActionKey } from './types'

interface CalDotComPluginProps {
  activity: Activity
  activityDetails: PluginActivityRecord
}

export const CalDotComPlugin: FC<CalDotComPluginProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case CalDotComActionKey.BOOK_APPOINTMENT:
      return <>{JSON.stringify(activityDetails)}</>
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

CalDotComPlugin.displayName = 'CalDotComPlugin'
