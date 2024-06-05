export type LogSeverity = 'INFO' | 'WARNING' | 'ERROR'

export enum LogEvent {
  FORM_SUBMITTING = 'FORM_SUBMITTING',
  FORM_SUBMITTED = 'FORM_SUBMITTED',
  FORM_SUBMISSION_FAILED = 'FORM_SUBMISSION_FAILED',
  FORM_WAITING_FOR_SUBMISSION = 'FORM_WAITING_FOR_SUBMISSION',
  FORM_WAITING_FOR_FETCH = 'FORM_WAITING_FOR_FETCH',
  FORM_FETCH_FAILED = 'FORM_FETCH_FAILED',

  SESSION_ONGOING = 'SESSION_ONGOING',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SESSION_COMPLETED = 'SESSION_COMPLETED',

  MESSAGE_MARKING_AS_READ = 'MESSAGE_MARKING_AS_READ',
  MESSAGE_MARKED_AS_READ = 'MESSAGE_MARKED_AS_READ',
  MESSAGE_MARKING_AS_READ_FAILED = 'MESSAGE_MARKING_AS_READ_FAILED',

  CHECKLIST_SUBMITTING = 'CHECKLIST_SUBMITTING',
  CHECKLIST_SUBMITTED = 'CHECKLIST_SUBMITTED',
  CHECKLIST_SUBMITTING_FAILED = 'CHECKLIST_SUBMITTING_FAILED',

  ACTIVITIES_FETCH = 'ACTIVITIES_FETCH',
  ACTIVITIES_FETCH_FAILED = 'ACTIVITIES_FETCH_FAILED',

  ACTIVITY_LOADING = 'ACTIVITY_LOADING',
}
