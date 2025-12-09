import React, { FC } from 'react'
import { Checklist as ChecklistComponent } from '@awell-health/ui-library'
import { Activity, useChecklist } from '../../hooks/useChecklist'
import { useSubmitChecklist } from '../../hooks/useSubmitChecklist'
import { LoadingPage } from '../LoadingPage'
import { ErrorPage } from '../ErrorPage'
import { useTranslation } from 'next-i18next'
import * as Sentry from '@sentry/nextjs'
import { useHostedSession } from '../../hooks/useHostedSession'
import { isEmpty } from 'lodash'

interface ChecklistProps {
  activity: Activity
}

export const Checklist: FC<ChecklistProps> = ({ activity }) => {
  const { t } = useTranslation()
  const { theme } = useHostedSession()
  const { loading, items, title, error, refetch } = useChecklist(activity)
  const { onSubmit, isSubmitting } = useSubmitChecklist(activity)

  if (loading) {
    return <LoadingPage />
  }

  if (error) {
    return (
      <ErrorPage
        title={t('activities.checklist.loading_error', { error })}
        onRetry={refetch}
      />
    )
  }

  const handleSubmit = () => {
    Sentry.logger.info('Submitting checklist', {
      category: 'submit_checklist',
      checklist_id: activity.object.id,
    })
    onSubmit()
  }

  return (
    <ChecklistComponent
      title={title || ''}
      items={items || []}
      onSubmit={handleSubmit}
      disabled={isSubmitting}
      submitLabel={
        isEmpty(theme.locales.checklist.cta_submit)
          ? t('activities.checklist.cta_submit')
          : theme.locales.checklist.cta_submit
      }
    />
  )
}

Checklist.displayName = 'Checklist'
