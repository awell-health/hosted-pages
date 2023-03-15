import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'

import type { Activity } from '../../../types/generated/types-orchestration'
import { ActivityName } from './types'

interface CalDotComPluginProps {
  activity: Activity
}

export const CalDotComPlugin: FC<CalDotComPluginProps> = ({ activity }) => {
  const { t } = useTranslation()

  switch (activity?.object.name) {
    case ActivityName.BOOK_APPOINTMENT:
      return <>{JSON.stringify(activity)}</>
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

CalDotComPlugin.displayName = 'CalDotComPlugin'
