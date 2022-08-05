import { useTranslation } from 'react-i18next'
import { useGetFormQuery, ActivityStatus } from './types'
import type { Form, Activity } from './types'

interface UseFormHook {
  loading: boolean
  form?: Form
  error?: string
}

export const useForm = (activity: Activity): UseFormHook => {
  const { t } = useTranslation()

  const {
    data: formData,
    loading: formLoading,
    error,
  } = useGetFormQuery({
    variables: {
      id: activity.object.id,
    },
    onError: (error) => {
      console.error('ERROR', error)
      throw error
    },
    onCompleted: () => {
      if (activity.status === ActivityStatus.Done) {
        //TODO Navigate to success page
      }
    },
  })

  if (formLoading) {
    return { loading: true }
  }
  if (error) {
    return { loading: false, error: error.message }
  }

  return {
    loading: false,
    form: formData?.form.form,
  }
}
