import { WizardForm } from '@awell_health/ui-library'
import React, { FC } from 'react'
import { useForm, Form as FormType } from '../../hooks/useForm'
import { useEvaluateFormRules } from '../../hooks/useEvaluateFormRules'
import {
  Activity,
  AnswerInput,
  QuestionRuleResult,
} from '../../types/generated/types-orchestration'
import { LoadingPage } from '../LoadingPage'
import { useSubmitForm } from '../../hooks/useSubmitForm'
import { useTranslation } from 'next-i18next'
import { ErrorPage } from '../ErrorPage'
import { addSentryBreadcrumb } from '../../services/ErrorReporter'
import { BreadcrumbCategory } from '../../services/ErrorReporter/addSentryBreadcrumb'

interface FormProps {
  activity: Activity
}

export const Form: FC<FormProps> = ({ activity }) => {
  const { loading, form, error, refetch } = useForm(activity)
  const { t } = useTranslation()
  const [evaluateFormRules] = useEvaluateFormRules(activity.object.id)
  const { onSubmit } = useSubmitForm({ activity })

  if (loading) {
    return <LoadingPage title={t('activities.form.loading')} />
  }
  if (error) {
    return (
      <ErrorPage title={t('activities.form.loading_error')} onRetry={refetch} />
    )
  }

  const handleEvaluateFormRules = async (
    response: Array<AnswerInput>
  ): Promise<Array<QuestionRuleResult>> => {
    addSentryBreadcrumb({
      category: BreadcrumbCategory.EVALUATE_FORM_RULES,
      data: {
        response,
        form,
      },
    })
    return evaluateFormRules(response)
  }

  const handleSubmit = async (response: Array<any>) => {
    addSentryBreadcrumb({
      category: BreadcrumbCategory.SUBMIT_FORM,
      data: {
        response,
        form,
      },
    })
    await onSubmit(response)
  }

  //FIXME type - need to be fixed in ui-lib
  return (
    <WizardForm
      form={form as any}
      buttonLabels={{
        prev: t('activities.form.previous_question_label'),
        next: t('activities.form.next_question_label'),
        submit: t('activities.form.cta_submit'),
        start_form: t('activities.form.cta_start_form'),
      }}
      errorLabels={{
        required: t('activities.form.question_required_error'),
        sliderNotTouched: t('activities.form.slider_not_touched_error'),
      }}
      onSubmit={handleSubmit}
      evaluateDisplayConditions={handleEvaluateFormRules}
    />
  )
}

Form.displayName = 'Form'
