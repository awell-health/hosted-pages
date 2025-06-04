import { isNil } from 'lodash'
import {
  Form,
  Option,
  DynamicFormGraphqlType as DynamicForm,
} from '../../types/generated/types-orchestration'

// Accepts either Form or DynamicFormGraphqlType and returns a normalized form object
export const mapForm = (
  form?: Form | DynamicForm | null
): Form | DynamicForm | undefined => {
  if (isNil(form)) {
    return undefined
  }

  return {
    ...form,
    questions: form.questions.map((question: any) => ({
      ...question,
      options: question.options?.map((option: any) => {
        return {
          ...option,
          value: option.value_string,
        } as Option
      }),
    })),
  }
}
