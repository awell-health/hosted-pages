import { ConversationalForm, TraditionalForm } from '@awell_health/ui-library'
import React, { FC } from 'react'
import { useForm } from '../../hooks/useForm'
import { useEvaluateFormRules } from '../../hooks/useEvaluateFormRules'
import {
  Activity,
  AnswerInput,
  FormDisplayMode,
  QuestionRuleResult,
} from '../../types/generated/types-orchestration'
import { LoadingPage } from '../LoadingPage'
import { useSubmitForm } from '../../hooks/useSubmitForm'
import { useTranslation } from 'next-i18next'
import { ErrorPage } from '../ErrorPage'
import { addSentryBreadcrumb, masker } from '../../services/ErrorReporter'
import { BreadcrumbCategory } from '../../services/ErrorReporter/addSentryBreadcrumb'
import useLocalStorage from 'use-local-storage'
import { useHostedSession } from '../../hooks/useHostedSession'

interface FormProps {
  activity: Activity
}

export const Form: FC<FormProps> = ({ activity }) => {
  const { loading, form, error, refetch } = useForm(activity)
  const { t } = useTranslation()
  const [evaluateFormRules] = useEvaluateFormRules(activity.object.id)
  const { onSubmit, isSubmitting } = useSubmitForm({ activity })
  const { branding } = useHostedSession()

  const [formProgress, setFormProgress] = useLocalStorage(activity.id, '')

  if (loading) {
    return <LoadingPage title={t('activities.form.loading')} />
  }
  if (isSubmitting) {
    return <LoadingPage title={t('activities.form.submitting')} />
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
        form_id: form?.id,
        response: masker(response),
      },
    })

    return evaluateFormRules(response)
  }

  const handleSubmit = async (response: Array<any>) => {
    addSentryBreadcrumb({
      category: BreadcrumbCategory.SUBMIT_FORM,
      data: {
        form_id: form?.id,
        response: masker(response),
      },
    })
    await onSubmit(response)
    setFormProgress(undefined)
  }

  const handleOnAnswersChange = (response: string): void => {
    if (response !== formProgress) {
      setFormProgress(response)
    }
  }

  const labels = {
    yes_label: t('activities.form.questions.yes_no.yes_answer'),
    no_label: t('activities.form.questions.yes_no.no_answer'),
    select: {
      search_placeholder: t(
        'activities.form.questions.select.search_placeholder'
      ),
      no_options: t('activities.form.questions.select.no_options'),
    },
  }

  const button_labels = {
    prev: t('activities.form.previous_question_label'),
    next: t('activities.form.next_question_label'),
    submit: t('activities.form.cta_submit'),
    start_form: t('activities.form.cta_start_form'),
  }

  const error_labels = {
    required: t('activities.form.question_required_error'),
    sliderNotTouched: t('activities.form.slider_not_touched_error'),
    invalidPhoneNumber: t('activities.form.invalid_phone_number'),
    formHasErrors: t('activities.form.form_has_errors'),
  }

  return activity.form_display_mode &&
    activity.form_display_mode === FormDisplayMode.Regular ? (
    <TraditionalForm
      form={form as any}
      questionLabels={labels}
      buttonLabels={button_labels}
      errorLabels={error_labels}
      onSubmit={handleSubmit}
      evaluateDisplayConditions={handleEvaluateFormRules}
      storedAnswers={formProgress}
      onAnswersChange={handleOnAnswersChange}
      autosaveAnswers={branding?.hosted_page_autosave ?? true}
    />
  ) : (
    <ConversationalForm
      form={form as any}
      questionLabels={labels}
      buttonLabels={button_labels}
      errorLabels={error_labels}
      onSubmit={handleSubmit}
      evaluateDisplayConditions={handleEvaluateFormRules}
      storedAnswers={formProgress}
      onAnswersChange={handleOnAnswersChange}
      autoProgress={branding?.hosted_page_auto_progress ?? false}
      autosaveAnswers={branding?.hosted_page_autosave ?? true}
    />
  )
}

Form.displayName = 'Form'
