import type { AnswerInput, QuestionRuleResult } from './types'
import { useEvaluateFormRulesMutation } from './types'
import { captureException } from '@sentry/nextjs'

export const useEvaluateFormRules = (
  form_id: string
): [(answers: Array<AnswerInput>) => Promise<Array<QuestionRuleResult>>] => {
  const [evaluateFormRules] = useEvaluateFormRulesMutation()

  return [
    async (answers: Array<AnswerInput>): Promise<Array<QuestionRuleResult>> => {
      try {
        const variables = {
          input: {
            form_id,
            answers,
          },
        }
        const { data } = await evaluateFormRules({
          variables,
          onError: (error) => {
            captureException(error, {
              contexts: {
                form: {
                  form_id,
                },
                answers: {
                  ...answers,
                },
                graphql: {
                  query: 'EvaluateFormRules',
                  variables: JSON.stringify(variables),
                },
              },
            })
          },
        })
        if (!data) {
          return []
        }
        return data.evaluateFormRules.results
      } catch (error) {
        return []
      }
    },
  ]
}
