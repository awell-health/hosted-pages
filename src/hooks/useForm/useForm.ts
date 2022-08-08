import { useGetFormQuery, ActivityStatus } from './types'
import type { Form, Activity } from './types'

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

  if (loading) {
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
