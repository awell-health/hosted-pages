import { toast } from 'react-toastify'
import { useTranslation } from 'next-i18next'
import type { Activity, Message } from './types'
import { useGetMessageQuery, useMarkMessageAsReadMutation } from './types'
import { useCurrentActivity } from '../activityNavigation'

interface UseMessageActivityHook {
  loading: boolean
  message?: Message
  error?: string
  onRead: () => Promise<void>
}

export const useMessage = ({
  activity,
}: {
  activity: Activity
}): UseMessageActivityHook => {
  const { t } = useTranslation()
  const {
    id: activity_id,
    object: { id: message_id },
  } = activity
  const { handleNavigateToNextActivity } = useCurrentActivity()

  const [markMessageAsRead] = useMarkMessageAsReadMutation()

  const { data, loading, error } = useGetMessageQuery({
    variables: { id: message_id },
  })

  const onRead = async () => {
    const id = toast.loading(t('message_mark_as_read'))
    try {
      await markMessageAsRead({
        variables: {
          input: {
            activity_id,
          },
        },
      })
      toast.update(id, {
        render: t('message_mark_as_read_success'),
        type: 'success',
        isLoading: false,
        autoClose: 500,
      })
      handleNavigateToNextActivity()
    } catch (err) {
      toast.update(id, {
        render: t('message_mark_as_read_error'),
        type: 'error',
        isLoading: false,
      })
    }
  }

  if (loading) {
    return {
      loading,
      onRead,
    }
  }

  if (error) {
    return {
      error: error.message,
      loading: false,
      onRead,
    }
  }

  return {
    loading,
    message: data?.message.message,
    onRead,
  }
}
