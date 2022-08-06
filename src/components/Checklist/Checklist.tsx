import React, { FC } from 'react'
import { Checklist as ChecklistComponent } from '@awell_health/ui-library'
import { Activity, useChecklist } from '../../hooks/useChecklist'
import { useSubmitChecklist } from '../../hooks/useSubmitChecklist'
import { LoadingPage } from '../LoadingPage'
import { ErrorPage } from '../ErrorPage'
import classes from './checklist.module.css'

interface ChecklistProps {
  activity: Activity
}

export const Checklist: FC<ChecklistProps> = ({ activity }) => {
  const { loading, items, title, error } = useChecklist({
    activity,
  })
  const { onSubmit, isSubmitting } = useSubmitChecklist({
    activity,
  })

  if (loading) {
    return <LoadingPage title="Loading activity" />
  }
  if (error) {
    return <ErrorPage title="Loading activity" />
  }

  return (
    <article className={classes.awell_checklist_wrapper}>
      <ChecklistComponent
        title={title || ''}
        items={items || []}
        onSubmit={onSubmit}
        disabled={isSubmitting}
        submitLabel="Submit"
      />
    </article>
  )
}

Checklist.displayName = 'Checklist'