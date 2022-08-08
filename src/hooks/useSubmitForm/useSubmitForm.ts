import { useState } from 'react'
import type { Activity, AnswerInput } from './types'
import { GetFormResponseDocument, useSubmitFormResponseMutation } from './types'
import { useCurrentActivity } from '../activityNavigation'

interface UseFormActivityHook {
  disabled: boolean
  onSubmit: (response: Array<AnswerInput>) => Promise<void>
}

export const useSubmitForm = ({
  activity,
}: {
  activity: Activity
}): UseFormActivityHook => {
  const { id: activity_id, stream_id: pathway_id } = activity
  const { handleNavigateToNextActivity } = useCurrentActivity()

  const [submitFormResponse] = useSubmitFormResponseMutation()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (response: Array<AnswerInput>) => {
    setIsSubmitting(true)
    try {
      await submitFormResponse({
        variables: {
          input: {
            activity_id,
            response,
          },
        },
        refetchQueries: [
          {
            query: GetFormResponseDocument,
            variables: {
              pathway_id,
              activity_id,
            },
          },
        ],
        awaitRefetchQueries: true,
      })

      handleNavigateToNextActivity()
    } catch (error) {
      setIsSubmitting(false)
      // TODO ???
      console.error(error)
    }
  }

  return {
    onSubmit,
    disabled: isSubmitting,
  }
}
