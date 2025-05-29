import { isNil } from 'lodash'
import { Form, Option } from '../../types/generated/types-orchestration'

export const mapForm = (form: Form | undefined | null) => {
  if (isNil(form)) {
    return undefined
  }
  return {
    ...form,
    questions: form.questions.map((question) => ({
      ...question,
      options: question.options?.map((option) => {
        // @ts-expect-error - TODO: deprecate `value` and replace it with `value_string` completely.
        return {
          ...option,
          value: option.value_string,
        } as Option
      }),
    })),
  }
}
