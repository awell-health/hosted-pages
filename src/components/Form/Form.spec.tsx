import { act, fireEvent, screen } from '@testing-library/react'
import { render, sliderQuestionForm, activity_mocks } from '../../../spec'
import { Form } from './Form'
import { Activity, AnswerInput, QuestionRuleResult } from './types'
import { ActivityObjectType, ActivityStatus } from '../Activities/types'
import { ActivityProvider } from '../Activities/context'
import { Form as FormType } from '../../hooks/useForm'

const renderForm = (activity: Activity, form: FormType) => {
  return render(
    <ActivityProvider>
      <Form activity={activity} />
    </ActivityProvider>,
    {
      mocks: {
        Query: {
          form: () => ({
            success: true,
            form,
          }),
          hostedSessionActivities: () => ({
            success: true,
            activities: [activity],
          }),
        },
        Mutation: {
          submitFormResponse: (): Activity => {
            return {
              ...activity,
              status: ActivityStatus.Done,
            }
          },
          evaluateFormRules: (
            answers: Array<AnswerInput>
          ): Array<QuestionRuleResult> => {
            return answers.map((answer) => ({
              question_id: answer.question_id,
              rule_id: '',
              satisfied: true,
            }))
          },
        },
      },
    }
  )
}

const generateOptionalSliderForm = () => {
  return {
    ...sliderQuestionForm,
    questions: [
      {
        ...sliderQuestionForm.questions[0],
        questionConfig: {
          mandatory: false,
        },
      },
      {
        ...sliderQuestionForm.questions[1],
      },
    ],
  }
}

describe('Form', () => {
  describe('Slider Form', () => {
    it('should display validation error when question is required and not touched', async () => {
      const activity = activity_mocks.activity({
        object: {
          id: sliderQuestionForm.id,
          type: ActivityObjectType.Form,
          name: sliderQuestionForm.title,
        },
      })
      renderForm(activity, sliderQuestionForm)

      await screen.findByText('*')
      await screen.findByText('This is slider question')
      // make sure activities.form.question_required_error is not in the document first
      expect(
        screen.queryByText('activities.form.question_required_error')
      ).toBe(null)

      const button = await screen.findByText(
        'activities.form.next_question_label'
      )
      act(() => {
        button.click()
      })
      await screen.findByText('activities.form.question_required_error')
    }),
      it('should not display validation error when question is required and slider has been touched', async () => {
        const activity = activity_mocks.activity({
          object: {
            id: sliderQuestionForm.id,
            type: ActivityObjectType.Form,
            name: sliderQuestionForm.title,
          },
        })
        renderForm(activity, sliderQuestionForm)

        await screen.findByText('*')
        await screen.findByText('This is slider question')
        // make sure activities.form.question_required_error is not in the document first
        expect(
          screen.queryByText('activities.form.question_required_error')
        ).toBe(null)

        const slider: HTMLInputElement = await screen.findByTestId(
          sliderQuestionForm.questions[0].id
        )
        fireEvent.change(slider, { target: { value: 5 } })

        const button = await screen.findByText(
          'activities.form.next_question_label'
        )
        act(() => {
          button.click()
        })
        // make sure activities.form.question_required_error is still not in the document
        expect(
          screen.queryByText('activities.form.question_required_error')
        ).toBe(null)
      }),
      it('should not display an error when question is not required and not touched', async () => {
        const activity = activity_mocks.activity({
          object: {
            id: sliderQuestionForm.id,
            type: ActivityObjectType.Form,
            name: sliderQuestionForm.title,
          },
        })

        renderForm(activity, generateOptionalSliderForm())

        await screen.findByText('This is slider question')
        // make sure activities.form.question_required_error is not in the document
        expect(screen.queryByText('*')).toBe(null)
        expect(
          screen.queryByText('activities.form.question_required_error')
        ).toBe(null)

        const button = await screen.findByText(
          'activities.form.next_question_label'
        )
        act(() => {
          button.click()
        })
        // make sure activities.form.question_required_error is not in the document
        expect(
          screen.queryByText('activities.form.question_required_error')
        ).toBe(null)
      }),
      it('should not display an error when question is not required and has been touched', async () => {
        const activity = activity_mocks.activity({
          object: {
            id: sliderQuestionForm.id,
            type: ActivityObjectType.Form,
            name: sliderQuestionForm.title,
          },
        })
        renderForm(activity, generateOptionalSliderForm())

        await screen.findByText('This is slider question')
        // make sure activities.form.question_required_error is not in the document
        expect(screen.queryByText('*')).toBe(null)
        expect(
          screen.queryByText('activities.form.question_required_error')
        ).toBe(null)

        const slider = await screen.findByTestId(
          sliderQuestionForm.questions[0].id
        )
        fireEvent.change(slider, { target: { value: 5 } })
        const button = await screen.findByText(
          'activities.form.next_question_label'
        )
        act(() => {
          button.click()
        })
        // make sure activities.form.question_required_error is not in the document
        expect(
          screen.queryByText('activities.form.question_required_error')
        ).toBe(null)
      })
  })
})
