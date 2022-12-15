import { useGetFormQuery, ActivityStatus, GetFormDocument } from './types'
import type { Form, Activity } from './types'
import { captureException } from '@sentry/nextjs'
import { isNil } from 'lodash'
import { useTranslation } from 'next-i18next'

interface UseFormHook {
  loading: boolean
  form?: Form
  error?: string
}

export const useForm = (activity: Activity): UseFormHook => {
  const {
    data: formData,
    loading,
    error,
  } = useGetFormQuery({
    variables: {
      id: activity.object.id,
    },
    onCompleted: () => {
      if (activity.status === ActivityStatus.Done) {
        //TODO Navigate to success page
      }
    },
  })
  const { t } = useTranslation()

  if (loading) {
    return { loading: true }
  }
  if (error || isNil(formData?.form?.form)) {
    const messsage = error?.message || t('activities.form.loading_error')
    const populatedError = error || new Error('Error fetching form')
    captureException(populatedError, {
      contexts: {
        form: {
          form_id: activity.object.id,
        },
        activity: {
          ...activity,
        },
      },
    })

    return { loading: false, error: messsage }
  }

  return {
    loading: false,
    form: formData?.form.form,
  }
}
