import type { AnswerInput, QuestionRuleResult } from './types'
import { useEvaluateFormRulesMutation } from './types'

export const useEvaluateFormRules = (
  form_id: string
): [(answers: Array<AnswerInput>) => Promise<Array<QuestionRuleResult>>] => {
  const [evaluateFormRules] = useEvaluateFormRulesMutation()

  return [
    async (answers: Array<AnswerInput>): Promise<Array<QuestionRuleResult>> => {
      try {
        const { data } = await evaluateFormRules({
          variables: {
            input: {
              form_id,
              answers,
            },
          },
        })
        if (!data) {
          return []
        }
        return data.evaluateFormRules.results
      } catch (error) {
        console.error(error)
        return []
      }
    },
  ]
}
