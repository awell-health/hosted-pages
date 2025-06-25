import type { AnswerInput, QuestionRuleResult } from './types'
import { useEvaluateFormRulesMutation } from './types'
import { captureException } from '@sentry/nextjs'
import { useLogging } from '../useLogging'
import { LogEvent } from '../useLogging/types'
import { GraphQLError } from 'graphql'

interface UseEvaluateFormRulesHook {
  evaluateFormRules: (
    answers: Array<AnswerInput>
  ) => Promise<Array<QuestionRuleResult>>
}

export const useEvaluateFormRules = (
  form_id: string
): UseEvaluateFormRulesHook => {
  const [evaluateFormRulesMutation] = useEvaluateFormRulesMutation()
  const { errorLog } = useLogging()

  const handleError = (
    errors: any | GraphQLError[],
    answers: Array<AnswerInput>,
    contextVariables?: Record<string, any>
  ) => {
    const error = Array.isArray(errors)
      ? new Error('A graphql error occurred while evaluating form rules')
      : errors

    errorLog(
      `Error evaluating form rules for form ${form_id}: ${error.message}`,
      {
        form_id,
        answers,
        errors,
      },
      error,
      LogEvent.FORM_RULE_EVALUATION_FAILED
    )
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
          variables: contextVariables
            ? JSON.stringify(contextVariables)
            : undefined,
          errors: JSON.stringify(errors),
        },
      },
    })
  }

  const evaluateFormRules = async (
    answers: Array<AnswerInput>
  ): Promise<Array<QuestionRuleResult>> => {
    const variables = {
      input: {
        form_id,
        answers,
      },
    }
    try {
      const { data, errors } = await evaluateFormRulesMutation({
        variables,
      })

      if (errors && errors.length > 0) {
        handleError(errors, answers, variables)
        return []
      }

      if (!data) {
        return []
      }
      return data.evaluateFormRules.results
    } catch (error) {
      handleError(error, answers, variables)
      return []
    }
  }

  return {
    evaluateFormRules,
  }
}
