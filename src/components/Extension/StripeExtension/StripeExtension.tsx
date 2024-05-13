import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'
import { EmbeddedCheckout } from './actions'

import { ActionKey } from './types'
import type { ExtensionActivityRecord } from '../types'

interface StripeExtensionProps {
  activityDetails: ExtensionActivityRecord
}

export const StripeExtension: FC<StripeExtensionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case ActionKey.EMBEDDED_CHECKOUT:
      return <EmbeddedCheckout activityDetails={activityDetails} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

StripeExtension.displayName = 'ExperimentalExtension'
