import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../ErrorPage'
import { PluginId } from './types'

import type { Activity } from '../../types/generated/types-orchestration'
import { CalDotComPlugin } from './CalDotComPlugin'

interface PluginProps {
  activity: Activity
}

export const Plugin: FC<PluginProps> = ({ activity }) => {
  const { t } = useTranslation()

  switch (activity?.indirect_object?.id) {
    case PluginId.CAL_DOT_COM:
      return <CalDotComPlugin activity={activity} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

Plugin.displayName = 'Plugin'
