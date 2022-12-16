import { addBreadcrumb } from '@sentry/nextjs'
import { get } from 'lodash'

export enum BreadcrumbCategory {
  EVALUATE_FORM_RULES = 'EVALUATE_FORM_RULES',
  SUBMIT_FORM = 'SUBMIT_FORM',
  SESSION_COMPLETE = 'SESSION_COMPLETE',
  SESSION_EXPIRE = 'SESSION_EXPIRE',
  SESSION_CANCEL = 'SESSION_CANCEL',
  READ_MESSAGE = 'READ_MESSAGE',
  SUBMIT_CHECKLIST = 'SUBMIT_CHECKLIST',
  GENERIC = 'generic',
}

const SentryBreadcrumbMessageDictionary = {
  [BreadcrumbCategory.EVALUATE_FORM_RULES]: 'Evaluating form rules',
  [BreadcrumbCategory.SUBMIT_FORM]: 'Submitting form',
  [BreadcrumbCategory.SESSION_COMPLETE]: 'Session completed',
  [BreadcrumbCategory.SESSION_CANCEL]: 'Session cancelled',
  [BreadcrumbCategory.SESSION_EXPIRE]: 'Session expired',
  [BreadcrumbCategory.READ_MESSAGE]: 'Reading message',
  [BreadcrumbCategory.SUBMIT_CHECKLIST]: 'Submitting checklist',
  [BreadcrumbCategory.GENERIC]: 'Generic event',
}

export const addSentryBreadcrumb = ({
  category,
  data,
}: {
  category: BreadcrumbCategory
  data:
    | {
        [key: string]: any
      }
    | undefined
}) => {
  addBreadcrumb({
    message: get(
      SentryBreadcrumbMessageDictionary,
      category,
      // default:
      SentryBreadcrumbMessageDictionary[BreadcrumbCategory.GENERIC]
    ),
    category,
    data: { context: JSON.stringify(data) },
  })
}
