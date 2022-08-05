import { WizardForm } from '@awell_health/ui-library'
import React, { FC } from 'react'
import { useForm } from '../../hooks/useForm'
import { useEvaluateFormRules } from '../../hooks/useEvaluateFormRules'
import {
  Activity,
  AnswerInput,
  QuestionRuleResult,
} from '../../types/generated/types-orchestration'
import { LoadingPage } from '../LoadingPage'
import { useSubmitForm } from '../../hooks/useSubmitForm'

interface FormProps {
  activity: Activity
}

export const Form: FC<FormProps> = ({ activity }) => {
  const { loading, form } = useForm(activity)
  const [evaluateFormRules] = useEvaluateFormRules(activity.object.id)
  const { onSubmit, disabled } = useSubmitForm({ activity })

  if (loading) {
    // TODO use i18n
    return <LoadingPage title="Loading form data" />
  }

  const handleEvaluateFormRules = async (
    response: Array<AnswerInput>
  ): Promise<Array<QuestionRuleResult>> => {
    return evaluateFormRules(response)
  }

  const handleSubmit = async (response: Array<any>) => {
    await onSubmit(response)
  }

  return (
    <WizardForm
      form={form as any}
      buttonLabels={{ prev: 'prev', next: 'next', submit: 'submit' }}
      errorLabels={{ required: 'this is required' }}
      onSubmit={handleSubmit}
      evaluateDisplayConditions={handleEvaluateFormRules}
    />
  )
}

Form.displayName = 'Form'
