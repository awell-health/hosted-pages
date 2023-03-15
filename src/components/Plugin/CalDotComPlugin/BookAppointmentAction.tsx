import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import type { PluginActivityRecord } from '../../../types/generated/types-orchestration'

interface BookAppointmentActionProps {
  activityDetails: PluginActivityRecord
}

export const BookAppointmentAction: FC<BookAppointmentActionProps> = ({
  activityDetails,
}) => {
  const { t } = useTranslation()

  return <>{JSON.stringify(activityDetails)}</>
}

BookAppointmentAction.displayName = 'BookAppointmentAction'
