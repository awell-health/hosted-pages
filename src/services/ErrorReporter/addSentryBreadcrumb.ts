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
  GENERIC = 'GENERIC',
  NAVIGATION = 'NAVIGATION',
  SLOW_REDIRECT = 'SLOW_REDIRECT',
  HOSTED_PAGES_LINK_ERROR = 'HOSTED_PAGES_LINK_ERROR',
  HOSTED_ACTIVITY_ERROR = 'HOSTED_ACTIVITY_ERROR',
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
  [BreadcrumbCategory.NAVIGATION]: 'Navigation',
  [BreadcrumbCategory.SLOW_REDIRECT]: 'Slow redirect at session end',
  [BreadcrumbCategory.HOSTED_PAGES_LINK_ERROR]: 'Error with hosted pages link',
  [BreadcrumbCategory.HOSTED_ACTIVITY_ERROR]: 'Error with hosted activity link',
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
