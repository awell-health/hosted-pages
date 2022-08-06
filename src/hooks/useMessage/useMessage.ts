import { useTranslation } from 'react-i18next'
import type { Activity, Message } from './types'
import { useGetMessageQuery, useMarkMessageAsReadMutation } from './types'

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
  const {
    id: activity_id,
    object: { id: message_id },
  } = activity
  const { t } = useTranslation()

  const [markMessageAsRead] = useMarkMessageAsReadMutation()

  const { data, loading, error } = useGetMessageQuery({
    variables: { id: message_id },
  })

  const onRead = async () => {
    try {
      await markMessageAsRead({
        variables: {
          input: {
            activity_id,
          },
        },
      })
    } catch (err) {
      console.error(err)
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
