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

interface FormProps {
  activity: Activity
}

export const Form: FC<FormProps> = ({ activity }) => {
  const { loading, form, error } = useForm(activity)
  const { t } = useTranslation()
  const [evaluateFormRules] = useEvaluateFormRules(activity.object.id)
  const { onSubmit, disabled } = useSubmitForm({ activity })

  if (loading) {
    return <LoadingPage title={t('form_loading')} />
  }
  if (error) {
    return <ErrorPage title={t('form_loading_error', { error })} />
  }

  const handleEvaluateFormRules = async (
    response: Array<AnswerInput>
  ): Promise<Array<QuestionRuleResult>> => {
    return evaluateFormRules(response)
  }

  const handleSubmit = async (response: Array<any>) => {
    await onSubmit(response)
  }

  //FIXME type - need to be fixed in ui-lib
  return (
    <WizardForm
      form={form as any}
      buttonLabels={{
        prev: t('form_previous_question_label'),
        next: t('form_next_question_label'),
        submit: t('submit'),
      }}
      errorLabels={{ required: t('form_question_required_error') }}
      onSubmit={handleSubmit}
      evaluateDisplayConditions={handleEvaluateFormRules}
    />
  )
}

Form.displayName = 'Form'
