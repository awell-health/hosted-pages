import type { AnswerInput, QuestionRuleResult } from './types'
import { useEvaluateFormRulesMutation } from './types'
import * as Sentry from '@sentry/nextjs'
import { GraphQLError } from 'graphql'
import { useHostedSession } from '../useHostedSession'
import { logger, LogEvent } from '../../utils/logging'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../utils/errors'

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
      `Error evaluating form rules for form ${form_id}: ${
        error instanceof Error ? error.message : String(error)
      }`,
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
        sessionId: session?.id,
        pathwayId: session?.pathway_id,
        stakeholderId: session?.stakeholder?.id,
        sessionStatus: session?.status,
        form_id,
        answers,
        errors: Array.isArray(errors) ? JSON.stringify(errors) : errors,
      }
    )
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
