import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'
import { BookAppointmentAction } from './BookAppointmentAction'

import type {
  Activity,
  PluginActivityRecord,
} from '../../../types/generated/types-orchestration'
import { ActionKey } from './types'

interface CalDotComExtensionProps {
  activity: Activity
  activityDetails: PluginActivityRecord
}

export const CalDotComExtension: FC<CalDotComExtensionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case ActionKey.BOOK_APPOINTMENT:
      return <BookAppointmentAction activityDetails={activityDetails} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

CalDotComExtension.displayName = 'CalDotComExtension'
