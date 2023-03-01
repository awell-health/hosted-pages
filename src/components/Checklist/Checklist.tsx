import React, { FC } from 'react'
import { Checklist as ChecklistComponent } from '@awell_health/ui-library'
import { Activity, useChecklist } from '../../hooks/useChecklist'
import { useSubmitChecklist } from '../../hooks/useSubmitChecklist'
import { LoadingPage } from '../LoadingPage'
import { ErrorPage } from '../ErrorPage'
import { useTranslation } from 'next-i18next'
import { addSentryBreadcrumb } from '../../services/ErrorReporter'
import { BreadcrumbCategory } from '../../services/ErrorReporter/addSentryBreadcrumb'

interface ChecklistProps {
  activity: Activity
}

export const Checklist: FC<ChecklistProps> = ({ activity }) => {
  const { t } = useTranslation()
  const { loading, items, title, error, refetch } = useChecklist({
    activity,
  })
  const { onSubmit, isSubmitting } = useSubmitChecklist({
    activity,
  })

  if (loading) {
    return <LoadingPage title={t('activities.checklist.loading')} />
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
    addSentryBreadcrumb({
      category: BreadcrumbCategory.SUBMIT_CHECKLIST,
      data: {
        checklist_id: activity.object.id,
      },
    })
    onSubmit()
  }

  return (
    <ChecklistComponent
      title={title || ''}
      items={items || []}
      onSubmit={handleSubmit}
      disabled={isSubmitting}
      submitLabel={t('activities.checklist.cta_submit')}
    />
  )
}

Checklist.displayName = 'Checklist'
