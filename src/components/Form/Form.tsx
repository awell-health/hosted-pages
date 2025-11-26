import { ConversationalForm, TraditionalForm } from '@awell-health/ui-library'
import { ErrorLabels } from '@awell-health/ui-library/dist/types/hooks/useForm/types'
import { isEmpty, isNil } from 'lodash'
import { useTranslation } from 'next-i18next'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'
import useLocalStorage from 'use-local-storage'
import { useEvaluateFormRules } from '../../hooks/useEvaluateFormRules'
import { useFileUpload } from '../../hooks/useFileUpload'
import { useHostedSession } from '../../hooks/useHostedSession'
import { useLogging } from '../../hooks/useLogging'
import { LogEvent } from '../../hooks/useLogging/types'
import { useSubmitForm } from '../../hooks/useSubmitForm'
import { addSentryBreadcrumb, masker } from '../../services/ErrorReporter'
import { BreadcrumbCategory } from '../../services/ErrorReporter/addSentryBreadcrumb'
import { ErrorPage } from '../ErrorPage'
import { LoadingPage } from '../LoadingPage'
import {
  Activity,
  AnswerInput,
  FormActivityInputs,
  FormDisplayMode,
  QuestionRuleResult,
  Form as FormType,
  DynamicForm as DynamicFormType,
} from './types'
import { mapForm } from './mapper'
import {
  ActivityInputType,
  DynamicFormActivityInputs,
} from '../../types/generated/types-orchestration'

interface FormProps {
  activity: Activity
}

/**
 * A note about this component.
 * There is an unknown error that breaks conversational forms. The root cause is unknown but it may
 * be triggered or exacerbated by re-rendering the form component in the ui library.
 * In an attempt to mitigate this I have added more `useMemo` / `useCallback` than what we usually
 * have in the codebase.
 */

export const Form: FC<FormProps> = ({ activity }) => {
  const [form, setForm] = useState<FormType | DynamicFormType | undefined>(
    () => {
      if (activity.inputs?.type === ActivityInputType.Form) {
        return mapForm((activity.inputs as FormActivityInputs)?.form)
      } else if (activity.inputs?.type === ActivityInputType.DynamicForm) {
        return mapForm(
          (activity.inputs as DynamicFormActivityInputs)?.dynamicForm
        )
      }
      return undefined
    }
  )
  const { t } = useTranslation()
  const { evaluateFormRules } = useEvaluateFormRules(activity.object.id)
  const { onSubmit, isSubmitting } = useSubmitForm(activity)
  const { branding, theme } = useHostedSession()
  const { errorLog } = useLogging()
  const [getGcsSignedUrl] = useFileUpload()

  useEffect(() => {
    if (activity.inputs?.type === ActivityInputType.Form) {
      setForm(mapForm((activity.inputs as FormActivityInputs)?.form))
    } else if (activity.inputs?.type === ActivityInputType.DynamicForm) {
      setForm(
        mapForm((activity.inputs as DynamicFormActivityInputs)?.dynamicForm)
      )
    }
  }, [activity.inputs])

  /**
   * `persistedFormAnswers` stores the live state of the form answers in local storage.
   * This is updated every time an answer changes via `handleOnAnswersChange`.
   */
  const [persistedFormAnswers, setPersistedFormAnswers] = useLocalStorage(
    activity.id,
    ''
  )
  /**
   * `initialAnswersFromLocalStorage` captures the value of `persistedFormAnswers` once,
   * when this Form component instance initially mounts.
   * This stable initial value is then passed to the UI library's form components
   * (`TraditionalForm` and `ConversationalForm`) as their `storedAnswers` prop.
   * The library forms use this for initial population and then manage their own internal state.
   * This prevents re-feeding the continuously updated local storage answers back into the
   * library forms as a prop, which could lead to unintended re-renders or state conflicts
   * within those components. The primary goal is to load saved progress on initial load
   * and continuously save new progress.
   */
  const [initialAnswersFromLocalStorage] = useState(persistedFormAnswers)

  const handleEvaluateFormRules = useCallback(
    async (
      response: Array<AnswerInput>
    ): Promise<Array<QuestionRuleResult>> => {
      addSentryBreadcrumb({
        category: BreadcrumbCategory.EVALUATE_FORM_RULES,
        data: {
          form_id: activity.object.id,
          response: masker(response),
        },
      })
      return evaluateFormRules(response)
    },
    []
  )

  const handleSubmit = useCallback(
    async (response: Array<any>) => {
      addSentryBreadcrumb({
        category: BreadcrumbCategory.SUBMIT_FORM,
        data: {
          form_id: activity.object.id,
          response: masker(response),
        },
      })

      const isSubmitted = await onSubmit(response)

      if (isSubmitted) {
        // Clear the persisted answers from local storage after successful submission
        setPersistedFormAnswers(undefined)
      }
    },
    [onSubmit, activity.object.id, setPersistedFormAnswers]
  )

  const handleOnAnswersChange = useCallback(
    (response: string): void => {
      // Update the live answers in local storage whenever they change
      if (response !== persistedFormAnswers) {
        setPersistedFormAnswers(response)
      }
    },
    [persistedFormAnswers, setPersistedFormAnswers]
  )

  const handleFileUpload = useCallback(
    async (file: File, config_slug?: string): Promise<string> => {
      try {
        if (isNil(config_slug)) {
          throw new Error('Config ID is required')
        }

        // Get signed URL with milliseconds for expires_in (some APIs expect milliseconds)
        const { upload_url, file_url, required_headers } =
          await getGcsSignedUrl({
            file_name: file.name,
            content_type: file.type,
            expires_in: 360000,
            config_slug,
            activity_id: activity.id,
          })

        // Make sure we're using the exact content type that was used to generate the signed URL
        let contentType = 'application/octet-stream'
        try {
          const url = new URL(upload_url)
          const signedHeaders = url.searchParams.get('X-Goog-SignedHeaders')
          if (signedHeaders && signedHeaders.includes('content-type')) {
            contentType = file.type || 'application/octet-stream'
          }
        } catch (e) {
          console.warn('Error parsing URL:', e)
        }

        const response = await fetch(upload_url, {
          method: 'PUT',
          body: file,
          headers: {
            'Content-Type': contentType,
            'Content-Length': file.size.toString(),
            Origin: window.location.origin,
            ...(required_headers || {}),
          },
          credentials: 'omit',
          mode: 'cors',
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Failed to upload file ${file.name}: ${errorText}`)
          throw new Error(
            `Failed to upload file: ${response.status} ${response.statusText}`
          )
        }

        return file_url
      } catch (error) {
        throw error
      }
    },
    []
  )

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

  const error_labels: ErrorLabels = useMemo(
    () => ({
      required: t('activities.form.question_required_error'),
      sliderNotTouched: t('activities.form.slider_not_touched_error'),
      invalidPhoneNumber: t('activities.form.invalid_phone_number'),
      formHasErrors: t('activities.form.form_has_errors'),
      dateCannotBeInTheFuture: t(
        'activities.form.date_cannot_be_in_the_future'
      ),
      dateCannotBeInThePast: t('activities.form.date_cannot_be_in_the_past'),
      dateCannotBeToday: t('activities.form.date_cannot_be_today'),
      notANumber: t('activities.form.not_a_number'),
      numberOutOfRange: t('activities.form.number_out_of_range'),
      emailInvalidFormat: t('activities.form.email_invalid_format'),
    }),
    []
  )

  const renderTraditionalForm =
    activity.form_display_mode &&
    activity.form_display_mode === FormDisplayMode.Regular

  if (isNil(form)) {
    errorLog(
      `Form ${activity.object.name} fetch failed`,
      {
        activity,
        form,
      },
      'Form is null',
      LogEvent.FORM_FETCH_FAILED
    )
    return <ErrorPage title={t('activities.form.loading_error')} />
  }
  if (isSubmitting) {
    return <LoadingPage />
  }

  return (
    <>
      {renderTraditionalForm && (
        <TraditionalForm
          form={form as FormType} // dirty hack - let's update ui-lib to accept DynamicForm
          questionLabels={labels}
          buttonLabels={button_labels}
          errorLabels={error_labels}
          onSubmit={handleSubmit}
          evaluateDisplayConditions={handleEvaluateFormRules}
          storedAnswers={initialAnswersFromLocalStorage}
          onAnswersChange={handleOnAnswersChange}
          autosaveAnswers={branding?.hosted_page_autosave ?? true}
          onFileUpload={handleFileUpload}
        />
      )}
      {!renderTraditionalForm && (
        <ConversationalForm
          form={form as FormType} // dirty hack - let's update ui-lib to accept DynamicForm
          questionLabels={labels}
          buttonLabels={button_labels}
          errorLabels={error_labels}
          onSubmit={handleSubmit}
          evaluateDisplayConditions={handleEvaluateFormRules}
          storedAnswers={initialAnswersFromLocalStorage}
          onAnswersChange={handleOnAnswersChange}
          autoProgress={branding?.hosted_page_auto_progress ?? false}
          autosaveAnswers={branding?.hosted_page_autosave ?? true}
          showProgressBar={theme.form.showProgressBar}
          onFileUpload={handleFileUpload}
        />
      )}
    </>
  )
}

Form.displayName = 'Form'
