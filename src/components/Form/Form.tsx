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
import { ErrorLabels } from '@awell-health/ui-library/dist/types/hooks/useForm/types'
import { useLogging } from '../../hooks/useLogging'
import { LogEvent } from '../../hooks/useLogging/types'

interface FormProps {
  activity: Activity
}

export const Form: FC<FormProps> = ({ activity }) => {
  const { loading: isFetching, form, error, refetch } = useForm(activity)
  const { t } = useTranslation()
  const [evaluateFormRules] = useEvaluateFormRules(activity.object.id)
  const { onSubmit, isSubmitting } = useSubmitForm(activity)
  const { branding, theme } = useHostedSession()
  const { infoLog, errorLog } = useLogging()

  const [formProgress, setFormProgress] = useLocalStorage(activity.id, '')

  if (isFetching) {
    infoLog(
      {
        activity,
        formProgress,
      },
      LogEvent.FORM_WAITING_FOR_FETCH
    )
    return <LoadingPage />
  }
  if (error || isNil(form)) {
    errorLog(
      {
        activity,
        form,
      },
      error ? error : 'Form is null',
      LogEvent.FORM_FETCH_FAILED
    )
    return (
      <ErrorPage title={t('activities.form.loading_error')} onRetry={refetch} />
    )
  }
  if (isSubmitting) {
    infoLog(
      {
        activity,
        form,
      },
      LogEvent.FORM_WAITING_FOR_SUBMISSION
    )
    return <LoadingPage />
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

    const isSubmitted = await onSubmit(response)

    if (isSubmitted) {
      setFormProgress(undefined)
    }
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
      icd_10_catalogue_description: t(
        'activities.form.questions.select.icd_10_catalogue_description'
      ),
      icd_10_catalogue_link: t(
        'activities.form.questions.select.icd_10_catalogue_link'
      ),
      search_icd_placeholder: t(
        'activities.form.questions.select.search_icd_placeholder'
      ),
    },
    slider: {
      tooltip_guide: t('activities.form.questions.slider.tooltip_guide'),
    },
  }

  const button_labels = {
    prev: isEmpty(theme.locales.form.previous_question_label)
      ? t('activities.form.previous_question_label')
      : theme.locales.form.previous_question_label,
    next: isEmpty(theme.locales.form.next_question_label)
      ? t('activities.form.next_question_label')
      : theme.locales.form.next_question_label,
    submit: isEmpty(theme.locales.form.cta_submit)
      ? t('activities.form.cta_submit')
      : theme.locales.form.cta_submit,
  }

  const error_labels: ErrorLabels = {
    required: t('activities.form.question_required_error'),
    sliderNotTouched: t('activities.form.slider_not_touched_error'),
    invalidPhoneNumber: t('activities.form.invalid_phone_number'),
    formHasErrors: t('activities.form.form_has_errors'),
    dateCannotBeInTheFuture: t('activities.form.date_cannot_be_in_the_future'),
    dateCannotBeInThePast: t('activities.form.date_cannot_be_in_the_past'),
    dateCannotBeToday: t('activities.form.date_cannot_be_today'),
    notANumber: t('activities.form.not_a_number'),
    numberOutOfRange: t('activities.form.number_out_of_range'),
    emailInvalidFormat: t('activities.form.email_invalid_format'),
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
          showProgressBar={theme.form.showProgressBar}
        />
      )}
    </>
  )
}

Form.displayName = 'Form'
