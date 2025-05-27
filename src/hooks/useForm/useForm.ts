import { useGetFormQuery } from './types'
import type { Form, Activity } from './types'
import { captureException } from '@sentry/nextjs'
import { isNil } from 'lodash'
import { useTranslation } from 'next-i18next'
import { Option } from '../../types/generated/types-orchestration'

interface UseFormHook {
  loading: boolean
  form?: Form
  error?: string
  refetch?: () => {}
}

export const useForm = (id: string): UseFormHook => {
  const variables = {
    id,
  }
  const {
    data: formData,
    loading,
    error,
    refetch,
  } = useGetFormQuery({
    variables,
  })
  const { t } = useTranslation()

  if (loading) {
    return { loading: true }
  }
  if (error || isNil(formData?.form?.form)) {
    const message = error?.message || t('activities.form.loading_error')
    const populatedError = error || new Error('Error fetching form')
    captureException(populatedError, {
      contexts: {
        form: {
          form_id: id,
        },
        graphql: {
          query: 'GetForm',
          variables: JSON.stringify(variables),
        },
      },
    })

    return { loading: false, error: message, refetch }
  }

  const form = formData?.form.form
  if (!isNil(form)) {
    const questions = form.questions.map((question) => ({
      ...question,
      options: question.options?.map((option) => {
        // @ts-expect-error - TODO: deprecate `value` and replace it with `value_string` completely.
        return {
          ...option,
          value: option.value_string,
        } as Option
      }),
    }))
    return {
      loading: false,
      form: {
        ...form,
        questions,
      },
      refetch,
    }
  }

  return {
    loading: false,
    form: formData?.form.form,
    refetch,
  }
}
