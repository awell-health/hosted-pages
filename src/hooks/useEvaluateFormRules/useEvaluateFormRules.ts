import { GraphQLError } from 'graphql'
import { HostedSessionStatus } from '../../types/generated/types-orchestration'
import {
  isGraphQLMissingAuthorizationError,
  isGraphQLRequestCancellation,
} from '../../services/graphql'
import {
  HostedSessionError,
  captureHostedSessionError,
  serializeError,
} from '../../utils/errors'
import { LogEvent, logger } from '../../utils/logging'
import { useHostedSession } from '../useHostedSession'
import type { AnswerInput, QuestionRuleResult } from './types'
import { useEvaluateFormRulesMutation } from './types'

interface UseEvaluateFormRulesHook {
  evaluateFormRules: (
    answers: Array<AnswerInput>
  ) => Promise<Array<QuestionRuleResult>>
}

export const useEvaluateFormRules = (
  form_id: string
): UseEvaluateFormRulesHook => {
  const [evaluateFormRulesMutation] = useEvaluateFormRulesMutation()
  const { session } = useHostedSession()

  const handleError = (
    errors: any | GraphQLError[],
    answers: Array<AnswerInput>,
    contextVariables?: Record<string, any>
  ) => {
    const error = Array.isArray(errors)
      ? new Error('A graphql error occurred while evaluating form rules')
      : errors

    const hostedSessionError = new HostedSessionError(
      `Error evaluating form rules for form ${form_id}: ${serializeError(
        error
      )}`,
      {
        errorType: 'FORM_RULE_EVALUATION_FAILED',
        operation: 'EvaluateFormRules',
        originalError: error,
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
      }
    )
    captureHostedSessionError(hostedSessionError)
    logger.error(
      `Error evaluating form rules for form ${form_id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
      LogEvent.FORM_RULE_EVALUATION_FAILED,
      {
        form_id,
        answers,
        errors: Array.isArray(errors) ? JSON.stringify(errors) : errors,
      }
    )
  }

  const evaluateFormRules = async (
    answers: Array<AnswerInput>
  ): Promise<Array<QuestionRuleResult>> => {
    if (session?.status !== HostedSessionStatus.Active) {
      return []
    }

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
      if (
        isGraphQLRequestCancellation(error) ||
        isGraphQLMissingAuthorizationError(error)
      ) {
        return []
      }

      handleError(error, answers, variables)
      return []
    }
  }

  return {
    evaluateFormRules,
  }
}
