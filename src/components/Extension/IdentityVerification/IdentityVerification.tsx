import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../../ErrorPage'
import { DobCheck } from './actions'

import { ActionKey } from './types'
import type { ExtensionActivityRecord } from '../types'

interface IdentityVerificationExtensionProps {
  activityDetails: ExtensionActivityRecord
}

export const IdentityVerification: FC<IdentityVerificationExtensionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  switch (activityDetails.plugin_action_key) {
    case ActionKey.DOB_CHECK:
      return <DobCheck activityDetails={activityDetails} />
    default:
      return <ErrorPage title={t('activities.activity_not_supported')} />
  }
}

IdentityVerification.displayName = 'IdentityVerification'
