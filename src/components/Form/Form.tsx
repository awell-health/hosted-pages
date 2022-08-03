import { WizardForm } from '@awell_health/ui-library'
import React, { FC } from 'react'
import { useForm } from '../../hooks/useForm'
import { Activity } from '../../types/generated/types-orchestration'

interface FormProps {
  activity: Activity
}

export const Form: FC<FormProps> = ({ activity }) => {
  const { loading, form } = useForm(activity)

  if (loading || !form) {
    return <div>Loading form</div>
  }

  const handleSubmit = async (response: Array<any>) => {
    console.log('response', response)
  }

  return (
    <WizardForm
      form={form as any}
      buttonLabels={{ prev: 'prev', next: 'next', submit: 'submit' }}
      errorLabels={{ required: 'this is required' }}
      onSubmit={handleSubmit}
      evaluateDisplayConditions={() => {
        return Promise.all([]).then(function () {
          return []
        })
      }}
    />
  )
}

Form.displayName = 'Form'
