import { ConversationalForm, TraditionalForm } from '@awell-health/ui-library'
import React, { FC } from 'react'
import { useForm } from '../../hooks/useForm'
import { useEvaluateFormRules } from '../../hooks/useEvaluateFormRules'
import {
  Activity,
  AnswerInput,
  FormDisplayMode,
  QuestionRuleResult,
} from './types'
import { LoadingPage } from '../LoadingPage'
import { useSubmitForm } from '../../hooks/useSubmitForm'
import { useTranslation } from 'next-i18next'
import { ErrorPage } from '../ErrorPage'
import { addSentryBreadcrumb, masker } from '../../services/ErrorReporter'
import { BreadcrumbCategory } from '../../services/ErrorReporter/addSentryBreadcrumb'
import useLocalStorage from 'use-local-storage'
import { useHostedSession } from '../../hooks/useHostedSession'
import { isEmpty, isNil } from 'lodash'
import { Option } from '../../types/generated/types-orchestration'

interface FormProps {
  activity: Activity
}

export const Form: FC<FormProps> = ({ activity }) => {
  const { loading: isFetching, form, error, refetch } = useForm(activity)
  const { t } = useTranslation()
  const [evaluateFormRules] = useEvaluateFormRules(activity.object.id)
  const { onSubmit, isSubmitting } = useSubmitForm(activity)
  const { branding, theme } = useHostedSession()

  const [formProgress, setFormProgress] = useLocalStorage(activity.id, '')

  if (isFetching) {
    return <LoadingPage title={t('activities.form.loading')} />
  }
  if (error || isNil(form)) {
    return (
      <ErrorPage title={t('activities.form.loading_error')} onRetry={refetch} />
    )
  }
  if (isSubmitting) {
    return <LoadingPage title={t('activities.form.submitting')} />
  }

  const modifiedQuestions = form?.questions.map((question) => {
    return {
      ...question,
      options: question?.options?.map((option) => {
        // @ts-expect-error - TODO: deprecate `value` and replace it with `value_string` completely.
        return {
          ...option,
          value: option?.value_string,
        } as Option
      }),
    }
  })

  const modifiedForm = {
    ...form,
    questions: modifiedQuestions,
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
    setFormProgress(undefined)
    await onSubmit(response)
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
    slider: {
      tooltip_guide: t('activities.form.questions.slider.tooltip_guide'),
    },
  }

  const button_labels = {
    prev: t('activities.form.previous_question_label'),
    next: t('activities.form.next_question_label'),
    submit: isEmpty(theme.locales.form.cta_submit)
      ? t('activities.form.cta_submit')
      : theme.locales.form.cta_submit,
    start_form: t('activities.form.cta_start_form'),
  }

  const error_labels = {
    required: t('activities.form.question_required_error'),
    sliderNotTouched: t('activities.form.slider_not_touched_error'),
    invalidPhoneNumber: t('activities.form.invalid_phone_number'),
    formHasErrors: t('activities.form.form_has_errors'),
  }

  const renderTraditionalForm =
    activity.form_display_mode &&
    activity.form_display_mode === FormDisplayMode.Regular

  return (
    <>
      {renderTraditionalForm && (
        <TraditionalForm
          form={modifiedForm}
          questionLabels={labels}
          buttonLabels={button_labels}
          errorLabels={error_labels}
          onSubmit={handleSubmit}
          evaluateDisplayConditions={handleEvaluateFormRules}
          storedAnswers={formProgress}
          onAnswersChange={handleOnAnswersChange}
          autosaveAnswers={branding?.hosted_page_autosave ?? true}
        />
      )}
      {!renderTraditionalForm && (
        <ConversationalForm
          form={modifiedForm}
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
      )}
    </>
  )
}

Form.displayName = 'Form'
