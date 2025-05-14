/* eslint-disable */
import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;

      export interface PossibleTypesResultData {
        possibleTypes: {
          [key: string]: string[]
        }
      }
      const result: PossibleTypesResultData = {
  "possibleTypes": {
    "PaginationAndSortingPayload": [
      "ActivitiesPayload",
      "DataPointPayload",
      "OrchestrationFactsPayload",
      "PathwaysPayload",
      "PatientsPayload",
      "PublishedPathwayDefinitionsPayload"
    ],
    "Payload": [
      "ActionPayload",
      "ActivityPayload",
      "ActivityTypesPayload",
      "AddActivityMetadataPayload",
      "AddIdentifierToPatientPayload",
      "AddTrackPayload",
      "ApiCallPayload",
      "ApiCallsPayload",
      "BaselineInfoPayload",
      "CalculationResultsPayload",
      "CancelScheduledTracksPayload",
      "ChecklistPayload",
      "ClinicalNotePayload",
      "CompleteExtensionActivityPayload",
      "CreatePatientPayload",
      "DecisionOutputsPayload",
      "ElementsPayload",
      "EmptyPayload",
      "EmrReportPayload",
      "EvaluateFormRulesPayload",
      "ExtensionActivityRecordPayload",
      "FileUploadGCSPayload",
      "FormPayload",
      "FormResponsePayload",
      "FormsPayload",
      "GenerateRetoolEmbedUrlPayload",
      "HostedPagesLinkPayload",
      "HostedSessionActivitiesPayload",
      "HostedSessionPayload",
      "IdentityVerificationPayload",
      "MarkMessageAsReadPayload",
      "MessagePayload",
      "OrchestrationFactsPromptPayload",
      "PathwayDataPointDefinitionsPayload",
      "PathwayPayload",
      "PatientDemographicsPayload",
      "PatientPathwaysPayload",
      "PatientPayload",
      "RetryApiCallPayload",
      "RetryWebhookCallPayload",
      "ScheduleTrackPayload",
      "ScheduledStepsPayload",
      "ScheduledTracksPayload",
      "SearchPatientsPayload",
      "StakeholdersPayload",
      "StartHostedActivitySessionPayload",
      "StartHostedPathwaySessionFromLinkPayload",
      "StartHostedPathwaySessionPayload",
      "StartPathwayPayload",
      "StartPathwayWithPatientIdentifierPayload",
      "StopTrackPayload",
      "SubmitChecklistPayload",
      "SubmitFormResponsePayload",
      "TenantPayload",
      "TracksPayload",
      "UpdateEmrReportStatusPayload",
      "UpdatePatientDemographicsQueryPayload",
      "UpdatePatientLanguagePayload",
      "UpdatePatientPayload",
      "WebhookCallPayload",
      "WebhookCallsPayload"
    ]
  }
};
      export default result;
    
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: any;
  /** Safe date scalar that can serialize string or date */
  SafeDate: any;
};

export type ActionComponent = {
  __typename?: 'ActionComponent';
  definition_id?: Maybe<Scalars['String']>;
  release_id?: Maybe<Scalars['String']>;
  title?: Maybe<Scalars['String']>;
};

export type ActionPayload = Payload & {
  __typename?: 'ActionPayload';
  calculationId: Scalars['String'];
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export enum ActionType {
  ApiCall = 'API_CALL',
  ApiCallGraphql = 'API_CALL_GRAPHQL',
  Calculation = 'CALCULATION',
  Checklist = 'CHECKLIST',
  ClinicalNote = 'CLINICAL_NOTE',
  Form = 'FORM',
  Message = 'MESSAGE',
  Plugin = 'PLUGIN',
  PushToEmr = 'PUSH_TO_EMR'
}

export type ActivitiesPayload = PaginationAndSortingPayload & {
  __typename?: 'ActivitiesPayload';
  activities: Array<Activity>;
  code: Scalars['String'];
  metadata?: Maybe<ActivityMetadata>;
  pagination?: Maybe<PaginationOutput>;
  sorting?: Maybe<SortingOutput>;
  success: Scalars['Boolean'];
};

export type Activity = {
  __typename?: 'Activity';
  action: ActivityAction;
  action_component?: Maybe<ActionComponent>;
  container_name?: Maybe<Scalars['String']>;
  context?: Maybe<PathwayContext>;
  date: Scalars['String'];
  form?: Maybe<Form>;
  /** Form display mode can either be conversational (1 question at a time) or regular (all questions at once). Only used in hosted pages for now. */
  form_display_mode?: Maybe<FormDisplayMode>;
  /** Url for icon, only used by extensions custom actions */
  icon_url?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  indirect_object?: Maybe<ActivityObject>;
  isUserActivity: Scalars['Boolean'];
  label?: Maybe<ActivityLabel>;
  metadata?: Maybe<Scalars['JSON']>;
  object: ActivityObject;
  public?: Maybe<Scalars['Boolean']>;
  reference_id: Scalars['String'];
  resolution?: Maybe<ActivityResolution>;
  session_id?: Maybe<Scalars['String']>;
  stakeholders?: Maybe<Array<ActivityObject>>;
  status: ActivityStatus;
  stream_id: Scalars['String'];
  sub_activities: Array<SubActivity>;
  subject: ActivitySubject;
  track?: Maybe<ActivityTrack>;
};

export enum ActivityAction {
  Activate = 'ACTIVATE',
  Added = 'ADDED',
  Assigned = 'ASSIGNED',
  Complete = 'COMPLETE',
  Computed = 'COMPUTED',
  Delegated = 'DELEGATED',
  Deliver = 'DELIVER',
  Discarded = 'DISCARDED',
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  FailedToSend = 'FAILED_TO_SEND',
  Generated = 'GENERATED',
  IsWaitingOn = 'IS_WAITING_ON',
  Postponed = 'POSTPONED',
  Processed = 'PROCESSED',
  Read = 'READ',
  Remind = 'REMIND',
  Reported = 'REPORTED',
  Scheduled = 'SCHEDULED',
  Send = 'SEND',
  Skipped = 'SKIPPED',
  Stopped = 'STOPPED',
  Submitted = 'SUBMITTED'
}

export type ActivityLabel = {
  __typename?: 'ActivityLabel';
  color: Scalars['String'];
  id?: Maybe<Scalars['String']>;
  text: Scalars['String'];
};

export type ActivityMetadata = {
  __typename?: 'ActivityMetadata';
  stakeholders?: Maybe<Array<ActivityObject>>;
};

export type ActivityObject = {
  __typename?: 'ActivityObject';
  email?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  name: Scalars['String'];
  preferred_language?: Maybe<Scalars['String']>;
  type: ActivityObjectType;
};

export enum ActivityObjectType {
  Action = 'ACTION',
  Agent = 'AGENT',
  ApiCall = 'API_CALL',
  Calculation = 'CALCULATION',
  Checklist = 'CHECKLIST',
  ClinicalNote = 'CLINICAL_NOTE',
  Decision = 'DECISION',
  EmrReport = 'EMR_REPORT',
  EmrRequest = 'EMR_REQUEST',
  EvaluatedRule = 'EVALUATED_RULE',
  Form = 'FORM',
  Message = 'MESSAGE',
  Pathway = 'PATHWAY',
  Patient = 'PATIENT',
  Plugin = 'PLUGIN',
  PluginAction = 'PLUGIN_ACTION',
  Reminder = 'REMINDER',
  Stakeholder = 'STAKEHOLDER',
  Step = 'STEP',
  Timer = 'TIMER',
  Track = 'TRACK',
  User = 'USER'
}

export type ActivityPayload = Payload & {
  __typename?: 'ActivityPayload';
  activity?: Maybe<Activity>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export enum ActivityResolution {
  Expired = 'EXPIRED',
  Failure = 'FAILURE',
  Success = 'SUCCESS'
}

export enum ActivityStatus {
  Active = 'ACTIVE',
  Canceled = 'CANCELED',
  Done = 'DONE',
  Expired = 'EXPIRED',
  Failed = 'FAILED'
}

export type ActivitySubject = {
  __typename?: 'ActivitySubject';
  id?: Maybe<Scalars['String']>;
  name: Scalars['String'];
  type: ActivitySubjectType;
};

export enum ActivitySubjectType {
  ApiCall = 'API_CALL',
  Awell = 'AWELL',
  Plugin = 'PLUGIN',
  Stakeholder = 'STAKEHOLDER',
  User = 'USER'
}

export type ActivityTrack = {
  __typename?: 'ActivityTrack';
  id?: Maybe<Scalars['String']>;
  title: Scalars['String'];
};

export type ActivityTypesPayload = Payload & {
  __typename?: 'ActivityTypesPayload';
  activityTypes: Array<Scalars['String']>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type AddActivityMetadataInput = {
  activity_id: Scalars['String'];
  metadata: Scalars['JSON'];
  note?: InputMaybe<Scalars['String']>;
};

export type AddActivityMetadataPayload = Payload & {
  __typename?: 'AddActivityMetadataPayload';
  activity: Activity;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type AddIdentifierToPatientInput = {
  identifier: IdentifierInput;
  patient_id: Scalars['String'];
};

export type AddIdentifierToPatientPayload = Payload & {
  __typename?: 'AddIdentifierToPatientPayload';
  code: Scalars['String'];
  patient?: Maybe<User>;
  success: Scalars['Boolean'];
};

export type AddTrackInput = {
  pathway_id: Scalars['String'];
  track_id: Scalars['String'];
};

export type AddTrackPayload = Payload & {
  __typename?: 'AddTrackPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type Address = {
  __typename?: 'Address';
  city?: Maybe<Scalars['String']>;
  country?: Maybe<Scalars['String']>;
  state?: Maybe<Scalars['String']>;
  street?: Maybe<Scalars['String']>;
  zip?: Maybe<Scalars['String']>;
};

export type AddressInput = {
  city?: InputMaybe<Scalars['String']>;
  country?: InputMaybe<Scalars['String']>;
  state?: InputMaybe<Scalars['String']>;
  street?: InputMaybe<Scalars['String']>;
  zip?: InputMaybe<Scalars['String']>;
};

export enum AllowedDatesOptions {
  All = 'ALL',
  Future = 'FUTURE',
  Past = 'PAST'
}

export type Answer = {
  __typename?: 'Answer';
  label?: Maybe<Scalars['String']>;
  question_id: Scalars['String'];
  value: Scalars['String'];
  value_type: DataPointValueType;
};

export type AnswerInput = {
  question_id: Scalars['String'];
  value: Scalars['String'];
};

export type ApiCall = {
  __typename?: 'ApiCall';
  created_at: Scalars['String'];
  id: Scalars['ID'];
  request: ApiCallRequest;
  responses: Array<ApiCallResponse>;
  status: ApiCallStatus;
  title: Scalars['String'];
};

export type ApiCallHeader = {
  __typename?: 'ApiCallHeader';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type ApiCallPayload = Payload & {
  __typename?: 'ApiCallPayload';
  api_call: ApiCall;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type ApiCallRequest = {
  __typename?: 'ApiCallRequest';
  body?: Maybe<Scalars['String']>;
  endpoint: Scalars['String'];
  headers: Array<ApiCallHeader>;
  method: ApiCallRequestMethod;
};

export enum ApiCallRequestMethod {
  Delete = 'DELETE',
  Get = 'GET',
  Patch = 'PATCH',
  Post = 'POST',
  Put = 'PUT'
}

export type ApiCallResponse = {
  __typename?: 'ApiCallResponse';
  body: Scalars['String'];
  date: Scalars['String'];
  status: Scalars['Float'];
};

export enum ApiCallStatus {
  Failed = 'Failed',
  InProgress = 'InProgress',
  Pending = 'Pending',
  PermanentlyFailed = 'PermanentlyFailed',
  Skipped = 'Skipped',
  Success = 'Success'
}

export type ApiCallsPayload = Payload & {
  __typename?: 'ApiCallsPayload';
  api_calls: Array<ApiCall>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type ApiPathwayContext = {
  __typename?: 'ApiPathwayContext';
  id: Scalars['String'];
  pathway_definition_id: Scalars['String'];
  patient_id?: Maybe<Scalars['String']>;
  start_date?: Maybe<Scalars['String']>;
};

export type AuditTrail = {
  __typename?: 'AuditTrail';
  date: Scalars['SafeDate'];
  user_email?: Maybe<Scalars['String']>;
  user_id: Scalars['String'];
};

export type BaselineDataPoint = {
  __typename?: 'BaselineDataPoint';
  definition: DataPointDefinition;
  value?: Maybe<Scalars['String']>;
};

export type BaselineInfoInput = {
  data_point_definition_id: Scalars['String'];
  value: Scalars['String'];
};

export type BaselineInfoPayload = Payload & {
  __typename?: 'BaselineInfoPayload';
  baselineDataPoints: Array<BaselineDataPoint>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export enum BooleanOperator {
  And = 'AND',
  Or = 'OR'
}

export type BrandingSettings = {
  __typename?: 'BrandingSettings';
  accent_color?: Maybe<Scalars['String']>;
  custom_theme?: Maybe<Scalars['String']>;
  /** Auto progress to the next question when using the conversational display mode in Hosted Pages. */
  hosted_page_auto_progress?: Maybe<Scalars['Boolean']>;
  /** Automatically save question answers locally in Hosted Pages */
  hosted_page_autosave?: Maybe<Scalars['Boolean']>;
  hosted_page_title?: Maybe<Scalars['String']>;
  logo_url?: Maybe<Scalars['String']>;
};

export type CalculationResultsPayload = Payload & {
  __typename?: 'CalculationResultsPayload';
  code: Scalars['String'];
  result: Array<SingleCalculationResult>;
  success: Scalars['Boolean'];
};

export type CancelScheduledTracksInput = {
  ids: Array<Scalars['String']>;
};

export type CancelScheduledTracksPayload = Payload & {
  __typename?: 'CancelScheduledTracksPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  unscheduled_ids: Array<Scalars['String']>;
};

export type CareflowVersion = {
  __typename?: 'CareflowVersion';
  live?: Maybe<Scalars['Boolean']>;
  release_date?: Maybe<Scalars['String']>;
  release_id?: Maybe<Scalars['String']>;
  version?: Maybe<Scalars['Float']>;
};

export type CareflowVersions = {
  __typename?: 'CareflowVersions';
  careflow_definition_id: Scalars['String'];
  versions?: Maybe<Array<CareflowVersion>>;
};

export type CareflowVersionsPayload = {
  __typename?: 'CareflowVersionsPayload';
  careflowVersions: Array<CareflowVersions>;
};

export type Checklist = {
  __typename?: 'Checklist';
  items: Array<Scalars['String']>;
  title: Scalars['String'];
};

export type ChecklistPayload = Payload & {
  __typename?: 'ChecklistPayload';
  checklist?: Maybe<Checklist>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type ChoiceRangeConfig = {
  __typename?: 'ChoiceRangeConfig';
  enabled?: Maybe<Scalars['Boolean']>;
  max?: Maybe<Scalars['Float']>;
  min?: Maybe<Scalars['Float']>;
};

export type ClinicalNotePayload = Payload & {
  __typename?: 'ClinicalNotePayload';
  clinical_note: GeneratedClinicalNote;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type CompleteExtensionActivityInput = {
  activity_id: Scalars['String'];
  data_points: Array<ExtensionDataPointInput>;
};

export type CompleteExtensionActivityPayload = Payload & {
  __typename?: 'CompleteExtensionActivityPayload';
  activity: Activity;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type Condition = {
  __typename?: 'Condition';
  id: Scalars['ID'];
  operand?: Maybe<Operand>;
  operator?: Maybe<ConditionOperator>;
  reference?: Maybe<Scalars['String']>;
  reference_key?: Maybe<Scalars['String']>;
};

export enum ConditionOperandType {
  Boolean = 'BOOLEAN',
  DataPoint = 'DATA_POINT',
  DataSource = 'DATA_SOURCE',
  Number = 'NUMBER',
  NumbersArray = 'NUMBERS_ARRAY',
  String = 'STRING',
  StringsArray = 'STRINGS_ARRAY'
}

export enum ConditionOperator {
  Contains = 'CONTAINS',
  DoesNotContain = 'DOES_NOT_CONTAIN',
  HasFileUploaded = 'HAS_FILE_UPLOADED',
  HasNoFileUploaded = 'HAS_NO_FILE_UPLOADED',
  IsAnyOf = 'IS_ANY_OF',
  IsEmpty = 'IS_EMPTY',
  IsEqualTo = 'IS_EQUAL_TO',
  IsGreaterThan = 'IS_GREATER_THAN',
  IsGreaterThanOrEqualTo = 'IS_GREATER_THAN_OR_EQUAL_TO',
  IsInRange = 'IS_IN_RANGE',
  IsLessThan = 'IS_LESS_THAN',
  IsLessThanOrEqualTo = 'IS_LESS_THAN_OR_EQUAL_TO',
  IsLessThanXDaysAgo = 'IS_LESS_THAN_X_DAYS_AGO',
  IsMoreThanXDaysAgo = 'IS_MORE_THAN_X_DAYS_AGO',
  IsNoneOf = 'IS_NONE_OF',
  IsNotEmpty = 'IS_NOT_EMPTY',
  IsNotEqualTo = 'IS_NOT_EQUAL_TO',
  IsNotTrue = 'IS_NOT_TRUE',
  IsToday = 'IS_TODAY',
  IsTrue = 'IS_TRUE'
}

export type CreatePatientInput = {
  address?: InputMaybe<AddressInput>;
  birth_date?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  first_name?: InputMaybe<Scalars['String']>;
  identifier?: InputMaybe<Array<IdentifierInput>>;
  last_name?: InputMaybe<Scalars['String']>;
  /** Must be in valid E164 telephone number format */
  mobile_phone?: InputMaybe<Scalars['String']>;
  national_registry_number?: InputMaybe<Scalars['String']>;
  patient_code?: InputMaybe<Scalars['String']>;
  /** Must be a valid IANA timezone */
  patient_timezone?: InputMaybe<Scalars['String']>;
  /** Must be in valid E164 telephone number format */
  phone?: InputMaybe<Scalars['String']>;
  /** ISO 639-1 shortcode */
  preferred_language?: InputMaybe<Scalars['String']>;
  /** Sex code as defined by ISO standard IEC_5218, 0 - NOT_KNOWN, 1 - MALE, 2 - FEMALE */
  sex?: InputMaybe<Sex>;
};

export type CreatePatientPayload = Payload & {
  __typename?: 'CreatePatientPayload';
  code: Scalars['String'];
  patient?: Maybe<User>;
  success: Scalars['Boolean'];
};

export type DataPoint = {
  __typename?: 'DataPoint';
  activity_id?: Maybe<Scalars['String']>;
  data_point_definition_id: Scalars['String'];
  data_set_id: Scalars['String'];
  date: Scalars['String'];
  id: Scalars['ID'];
  key?: Maybe<Scalars['String']>;
  serialized_value?: Maybe<Scalars['String']>;
  valueType: DataPointValueType;
};

export type DataPointDefinition = {
  __typename?: 'DataPointDefinition';
  category: DataPointSourceType;
  id: Scalars['ID'];
  key: Scalars['String'];
  /** Additional context on data point */
  metadata?: Maybe<Array<DataPointMetaDataItem>>;
  optional?: Maybe<Scalars['Boolean']>;
  /** Personally identifiable information */
  pii?: Maybe<Scalars['Boolean']>;
  possibleValues?: Maybe<Array<DataPointPossibleValue>>;
  range?: Maybe<Range>;
  source_definition_id: Scalars['String'];
  title: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  valueType: DataPointValueType;
};

export type DataPointInput = {
  data_point_definition_id: Scalars['String'];
  value: Scalars['String'];
};

export type DataPointMetaDataItem = {
  __typename?: 'DataPointMetaDataItem';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type DataPointPayload = PaginationAndSortingPayload & {
  __typename?: 'DataPointPayload';
  code: Scalars['String'];
  dataPoints: Array<DataPoint>;
  pagination?: Maybe<PaginationOutput>;
  sorting?: Maybe<SortingOutput>;
  success: Scalars['Boolean'];
};

export type DataPointPossibleValue = {
  __typename?: 'DataPointPossibleValue';
  label?: Maybe<Scalars['String']>;
  value: Scalars['String'];
};

export enum DataPointSourceType {
  Agent = 'AGENT',
  ApiCall = 'API_CALL',
  ApiCallStatus = 'API_CALL_STATUS',
  Calculation = 'CALCULATION',
  DataPoint = 'DATA_POINT',
  Decision = 'DECISION',
  ExtensionAction = 'EXTENSION_ACTION',
  ExtensionWebhook = 'EXTENSION_WEBHOOK',
  Form = 'FORM',
  Pathway = 'PATHWAY',
  PatientIdentifier = 'PATIENT_IDENTIFIER',
  PatientProfile = 'PATIENT_PROFILE',
  Step = 'STEP',
  Track = 'TRACK'
}

export enum DataPointValueType {
  Attachment = 'ATTACHMENT',
  AttachmentsArray = 'ATTACHMENTS_ARRAY',
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Json = 'JSON',
  Number = 'NUMBER',
  NumbersArray = 'NUMBERS_ARRAY',
  String = 'STRING',
  StringsArray = 'STRINGS_ARRAY',
  Telephone = 'TELEPHONE'
}

export type DateConfig = {
  __typename?: 'DateConfig';
  allowed_dates?: Maybe<AllowedDatesOptions>;
  include_date_of_response?: Maybe<Scalars['Boolean']>;
};

export type DateFilter = {
  gte?: InputMaybe<Scalars['String']>;
  lte?: InputMaybe<Scalars['String']>;
};

export type DateRangeInput = {
  from: Scalars['SafeDate'];
  to: Scalars['SafeDate'];
};

export type DecisionOutputsPayload = Payload & {
  __typename?: 'DecisionOutputsPayload';
  code: Scalars['String'];
  outputs: Scalars['String'];
  success: Scalars['Boolean'];
};

export type DeletePathwayInput = {
  pathway_id: Scalars['String'];
};

export type DeletePatientInput = {
  patient_id: Scalars['String'];
};

export type EmrRequest = {
  __typename?: 'EMRRequest';
  id?: Maybe<Scalars['String']>;
  status?: Maybe<Scalars['String']>;
};

export type Element = {
  __typename?: 'Element';
  activity_type?: Maybe<ActionType>;
  context: PathwayContext;
  end_date?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  label?: Maybe<ActivityLabel>;
  name: Scalars['String'];
  parent_id?: Maybe<Scalars['ID']>;
  stakeholders: Array<ElementStakeholder>;
  start_date: Scalars['String'];
  status: ElementStatus;
  type: ElementType;
};

export type ElementStakeholder = {
  __typename?: 'ElementStakeholder';
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
};

export enum ElementStatus {
  Active = 'ACTIVE',
  Discarded = 'DISCARDED',
  Done = 'DONE',
  Postponed = 'POSTPONED',
  Scheduled = 'SCHEDULED',
  Stopped = 'STOPPED'
}

export enum ElementType {
  Action = 'ACTION',
  Agent = 'AGENT',
  Pathway = 'PATHWAY',
  Step = 'STEP',
  Track = 'TRACK',
  Trigger = 'TRIGGER'
}

export type ElementsPayload = Payload & {
  __typename?: 'ElementsPayload';
  code: Scalars['String'];
  elements: Array<Element>;
  success: Scalars['Boolean'];
};

export type EmptyPayload = Payload & {
  __typename?: 'EmptyPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type EmrReport = {
  __typename?: 'EmrReport';
  id: Scalars['ID'];
  message_html: Scalars['String'];
  metadata?: Maybe<Array<EmrReportMetadataField>>;
};

export type EmrReportMetadataField = {
  __typename?: 'EmrReportMetadataField';
  id: Scalars['ID'];
  label: Scalars['String'];
  value?: Maybe<Scalars['String']>;
};

export type EmrReportPayload = Payload & {
  __typename?: 'EmrReportPayload';
  code: Scalars['String'];
  report?: Maybe<EmrReport>;
  success: Scalars['Boolean'];
};

export type EvaluateFormRulesInput = {
  answers: Array<AnswerInput>;
  form_id: Scalars['String'];
};

export type EvaluateFormRulesPayload = Payload & {
  __typename?: 'EvaluateFormRulesPayload';
  code: Scalars['String'];
  results: Array<QuestionRuleResult>;
  success: Scalars['Boolean'];
};

export type ExclusiveOptionConfig = {
  __typename?: 'ExclusiveOptionConfig';
  enabled?: Maybe<Scalars['Boolean']>;
  option_id?: Maybe<Scalars['String']>;
};

export type ExpireTimerInput = {
  activity_id: Scalars['String'];
  user_name: Scalars['String'];
};

export type ExtensionActionField = {
  __typename?: 'ExtensionActionField';
  id: Scalars['ID'];
  label: Scalars['String'];
  type: ExtensionActionFieldType;
  value: Scalars['String'];
};

export enum ExtensionActionFieldType {
  Boolean = 'BOOLEAN',
  Date = 'DATE',
  Html = 'HTML',
  Json = 'JSON',
  Numeric = 'NUMERIC',
  NumericArray = 'NUMERIC_ARRAY',
  String = 'STRING',
  StringArray = 'STRING_ARRAY',
  Text = 'TEXT'
}

export type ExtensionActivityRecord = {
  __typename?: 'ExtensionActivityRecord';
  activity_id: Scalars['String'];
  data_points: Array<ExtensionDataPoint>;
  date: Scalars['String'];
  fields: Array<ExtensionActionField>;
  id: Scalars['ID'];
  pathway_id: Scalars['String'];
  plugin_action_key: Scalars['String'];
  plugin_key: Scalars['String'];
  settings?: Maybe<Array<PluginActionSettingsProperty>>;
};

export type ExtensionActivityRecordPayload = Payload & {
  __typename?: 'ExtensionActivityRecordPayload';
  code: Scalars['String'];
  record: ExtensionActivityRecord;
  success: Scalars['Boolean'];
};

export type ExtensionDataPoint = {
  __typename?: 'ExtensionDataPoint';
  label: Scalars['String'];
  value: Scalars['String'];
};

export type ExtensionDataPointInput = {
  key: Scalars['String'];
  value: Scalars['String'];
};

export type FileStorageQuestionConfig = {
  __typename?: 'FileStorageQuestionConfig';
  accepted_file_types?: Maybe<Array<Scalars['String']>>;
  file_storage_config_slug?: Maybe<Scalars['String']>;
};

export type FileUploadGcsPayload = Payload & {
  __typename?: 'FileUploadGCSPayload';
  code: Scalars['String'];
  file_url: Scalars['String'];
  success: Scalars['Boolean'];
  upload_url: Scalars['String'];
};

export type FilterActivitiesParams = {
  action?: InputMaybe<StringArrayFilter>;
  activity_status?: InputMaybe<StringArrayFilter>;
  activity_type?: InputMaybe<StringArrayFilter>;
  pathway_definition_id?: InputMaybe<StringArrayFilter>;
  pathway_status?: InputMaybe<StringArrayFilter>;
  patient_id?: InputMaybe<TextFilterEquals>;
  stakeholders?: InputMaybe<StringArrayFilter>;
};

export type FilterCareflowActivitiesParams = {
  action?: InputMaybe<Array<Scalars['String']>>;
  activity_status?: InputMaybe<Array<Scalars['String']>>;
  activity_type?: InputMaybe<Array<Scalars['String']>>;
  date_range?: InputMaybe<DateRangeInput>;
  hide_system_activities?: InputMaybe<Scalars['Boolean']>;
  stakeholders?: InputMaybe<Array<Scalars['String']>>;
};

export type FilterPathwayDataPointDefinitionsParams = {
  category?: InputMaybe<StringArrayFilter>;
  value_type?: InputMaybe<StringArrayFilter>;
};

export type FilterPathways = {
  pathway_definition_id?: InputMaybe<IdFilter>;
  patient_id?: InputMaybe<StringArrayFilter>;
  release_id?: InputMaybe<StringArrayFilter>;
  start_date?: InputMaybe<DateFilter>;
  status?: InputMaybe<StringArrayFilter>;
  version?: InputMaybe<NumberArrayFilter>;
};

export type FilterPatientPathways = {
  status: StringArrayFilter;
};

export type FilterPatients = {
  name?: InputMaybe<TextFilter>;
  national_registry_number?: InputMaybe<TextFilterEquals>;
  patient_code?: InputMaybe<TextFilterEquals>;
  profile_id?: InputMaybe<StringArrayFilter>;
  search?: InputMaybe<TextFilterContains>;
};

export type Form = {
  __typename?: 'Form';
  definition_id: Scalars['String'];
  id: Scalars['ID'];
  key: Scalars['String'];
  metadata?: Maybe<Scalars['String']>;
  previous_answers?: Maybe<Array<PreviousAnswers>>;
  questions: Array<Question>;
  release_id: Scalars['String'];
  title: Scalars['String'];
  trademark?: Maybe<Scalars['String']>;
};


export type FormPrevious_AnswersArgs = {
  pathway_id: Scalars['String'];
};

export enum FormDisplayMode {
  Conversational = 'CONVERSATIONAL',
  Regular = 'REGULAR'
}

export type FormPayload = Payload & {
  __typename?: 'FormPayload';
  code: Scalars['String'];
  form?: Maybe<Form>;
  success: Scalars['Boolean'];
};

export type FormResponse = {
  __typename?: 'FormResponse';
  answers: Array<Answer>;
};

export type FormResponsePayload = Payload & {
  __typename?: 'FormResponsePayload';
  code: Scalars['String'];
  response: FormResponse;
  success: Scalars['Boolean'];
};

export type FormsPayload = Payload & {
  __typename?: 'FormsPayload';
  code: Scalars['String'];
  forms?: Maybe<Array<Form>>;
  success: Scalars['Boolean'];
};

export type GenerateRetoolEmbedUrlPayload = Payload & {
  __typename?: 'GenerateRetoolEmbedUrlPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  url?: Maybe<Scalars['String']>;
};

export type GeneratedClinicalNote = {
  __typename?: 'GeneratedClinicalNote';
  context: Array<GeneratedClinicalNoteContextField>;
  id: Scalars['ID'];
  narratives: Array<GeneratedClinicalNoteNarrative>;
};

export type GeneratedClinicalNoteContextField = {
  __typename?: 'GeneratedClinicalNoteContextField';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type GeneratedClinicalNoteNarrative = {
  __typename?: 'GeneratedClinicalNoteNarrative';
  body: Scalars['String'];
  id: Scalars['ID'];
  key: Scalars['String'];
  title: Scalars['String'];
};

export type HostedPagesLink = {
  __typename?: 'HostedPagesLink';
  id: Scalars['ID'];
  pathway_id: Scalars['String'];
  stakeholder_id?: Maybe<Scalars['String']>;
  url?: Maybe<Scalars['String']>;
};

export type HostedPagesLinkPayload = Payload & {
  __typename?: 'HostedPagesLinkPayload';
  code: Scalars['String'];
  /** The hosted pages link for the stakeholder. If there is no activity for the stakeholder in the care flow, this link will be null. */
  hosted_pages_link?: Maybe<HostedPagesLink>;
  success: Scalars['Boolean'];
};

export type HostedSession = {
  __typename?: 'HostedSession';
  cancel_url?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
  pathway_id: Scalars['String'];
  stakeholder: HostedSessionStakeholder;
  status: HostedSessionStatus;
  success_url?: Maybe<Scalars['String']>;
  user_context?: Maybe<HostedSessionUserContext>;
};

export type HostedSessionActivitiesPayload = Payload & {
  __typename?: 'HostedSessionActivitiesPayload';
  activities: Array<Activity>;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type HostedSessionPayload = Payload & {
  __typename?: 'HostedSessionPayload';
  branding?: Maybe<BrandingSettings>;
  code: Scalars['String'];
  metadata?: Maybe<SessionMetadata>;
  session: HostedSession;
  success: Scalars['Boolean'];
};

export type HostedSessionStakeholder = {
  __typename?: 'HostedSessionStakeholder';
  id: Scalars['ID'];
  name: Scalars['String'];
  type: HostedSessionStakeholderType;
};

export enum HostedSessionStakeholderType {
  Patient = 'PATIENT',
  Stakeholder = 'STAKEHOLDER'
}

export enum HostedSessionStatus {
  Active = 'ACTIVE',
  Completed = 'COMPLETED',
  Expired = 'EXPIRED'
}

export type HostedSessionUserContext = {
  __typename?: 'HostedSessionUserContext';
  stytch_member_email?: Maybe<Scalars['String']>;
  stytch_member_id?: Maybe<Scalars['String']>;
};

export type HostedSessionUserContextInput = {
  stytch_member_email?: InputMaybe<Scalars['String']>;
  stytch_member_id?: InputMaybe<Scalars['String']>;
};

export type IdFilter = {
  eq?: InputMaybe<Scalars['String']>;
};

export type Identifier = {
  __typename?: 'Identifier';
  system: Scalars['String'];
  value: Scalars['String'];
};

export type IdentifierInput = {
  system: Scalars['String'];
  value: Scalars['String'];
};

export type IdentifierSystem = {
  __typename?: 'IdentifierSystem';
  display_name: Scalars['String'];
  name: Scalars['String'];
  system: Scalars['String'];
};

export type IdentityVerificationPayload = Payload & {
  __typename?: 'IdentityVerificationPayload';
  code: Scalars['String'];
  is_verified: Scalars['Boolean'];
  success: Scalars['Boolean'];
};

export type InputValidationAllowed = {
  __typename?: 'InputValidationAllowed';
  letters?: Maybe<Scalars['Boolean']>;
  numbers?: Maybe<Scalars['Boolean']>;
  special?: Maybe<Scalars['Boolean']>;
  whitespace?: Maybe<Scalars['Boolean']>;
};

export type InputValidationConfig = {
  __typename?: 'InputValidationConfig';
  helper_text?: Maybe<Scalars['String']>;
  mode?: Maybe<Scalars['String']>;
  pattern?: Maybe<Scalars['String']>;
  simpleConfig?: Maybe<InputValidationSimpleConfig>;
};

export type InputValidationSimpleConfig = {
  __typename?: 'InputValidationSimpleConfig';
  allowed?: Maybe<InputValidationAllowed>;
  exactLength?: Maybe<Scalars['Float']>;
};

export type MarkMessageAsReadInput = {
  activity_id: Scalars['String'];
};

export type MarkMessageAsReadPayload = Payload & {
  __typename?: 'MarkMessageAsReadPayload';
  activity: Activity;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type Message = {
  __typename?: 'Message';
  attachments?: Maybe<Array<MessageAttachment>>;
  body: Scalars['String'];
  format?: Maybe<MessageFormat>;
  id: Scalars['ID'];
  subject?: Maybe<Scalars['String']>;
};

export type MessageAttachment = {
  __typename?: 'MessageAttachment';
  id: Scalars['ID'];
  name: Scalars['String'];
  type: MessageAttachmentType;
  url: Scalars['String'];
};

export enum MessageAttachmentType {
  File = 'FILE',
  Link = 'LINK',
  Video = 'VIDEO'
}

export enum MessageFormat {
  Html = 'HTML',
  Slate = 'SLATE'
}

export type MessagePayload = Payload & {
  __typename?: 'MessagePayload';
  code: Scalars['String'];
  message?: Maybe<Message>;
  success: Scalars['Boolean'];
};

export type MultipleSelectConfig = {
  __typename?: 'MultipleSelectConfig';
  exclusive_option?: Maybe<ExclusiveOptionConfig>;
  range?: Maybe<ChoiceRangeConfig>;
};

export type Mutation = {
  __typename?: 'Mutation';
  addActivityMetadata: AddActivityMetadataPayload;
  addIdentifierToPatient: AddIdentifierToPatientPayload;
  addTrack: AddTrackPayload;
  completeExtensionActivity: CompleteExtensionActivityPayload;
  createPatient: CreatePatientPayload;
  deletePathway: EmptyPayload;
  deletePatient: EmptyPayload;
  evaluateFormRules: EvaluateFormRulesPayload;
  expireTimer: EmptyPayload;
  markMessageAsRead: MarkMessageAsReadPayload;
  /** Retrieve patient demographics from an external system */
  requestPatientDemographics: PatientDemographicsPayload;
  retryActivity: EmptyPayload;
  retryAllApiCalls: EmptyPayload;
  retryAllFailedApiCalls: EmptyPayload;
  retryAllFailedWebhookCalls: EmptyPayload;
  retryAllFailedWebhookCallsForPathwayDefinition: EmptyPayload;
  retryAllWebhookCalls: EmptyPayload;
  retryApiCall: RetryApiCallPayload;
  retryPushToEmr: EmptyPayload;
  retryWebhookCall: RetryWebhookCallPayload;
  /** @deprecated We will be deactivating this endpoint in the future. */
  saveBaselineInfo: EmptyPayload;
  scheduleTrack: ScheduleTrackPayload;
  startHostedActivitySession: StartHostedActivitySessionPayload;
  startHostedActivitySessionViaHostedPagesLink: StartHostedActivitySessionPayload;
  /** Start a hosted pathway session for a patient uniquely identified by patient_id or patient_identifier. If neither patient_id or patient_identifier is provided, a new anonymous patient will be created. */
  startHostedPathwaySession: StartHostedPathwaySessionPayload;
  startHostedPathwaySessionFromLink: StartHostedPathwaySessionFromLinkPayload;
  startPathway: StartPathwayPayload;
  startPathwayWithPatientIdentifier: StartPathwayWithPatientIdentifierPayload;
  stopPathway: EmptyPayload;
  stopTrack: StopTrackPayload;
  submitChecklist: SubmitChecklistPayload;
  submitFormResponse: SubmitFormResponsePayload;
  unscheduleTracks: CancelScheduledTracksPayload;
  updateBaselineInfo: EmptyPayload;
  updateEmrReportStatus: UpdateEmrReportStatusPayload;
  updatePatient: UpdatePatientPayload;
  /** Update which patient was created after import request for logging purposes */
  updatePatientDemographicsQuery: UpdatePatientDemographicsQueryPayload;
  updatePatientLanguage: UpdatePatientLanguagePayload;
  verify_identity: IdentityVerificationPayload;
};


export type MutationAddActivityMetadataArgs = {
  input: AddActivityMetadataInput;
};


export type MutationAddIdentifierToPatientArgs = {
  input: AddIdentifierToPatientInput;
};


export type MutationAddTrackArgs = {
  input: AddTrackInput;
};


export type MutationCompleteExtensionActivityArgs = {
  input: CompleteExtensionActivityInput;
};


export type MutationCreatePatientArgs = {
  input?: InputMaybe<CreatePatientInput>;
};


export type MutationDeletePathwayArgs = {
  input: DeletePathwayInput;
};


export type MutationDeletePatientArgs = {
  input: DeletePatientInput;
};


export type MutationEvaluateFormRulesArgs = {
  input: EvaluateFormRulesInput;
};


export type MutationExpireTimerArgs = {
  input: ExpireTimerInput;
};


export type MutationMarkMessageAsReadArgs = {
  input: MarkMessageAsReadInput;
};


export type MutationRequestPatientDemographicsArgs = {
  input: PatientDemographicsInput;
};


export type MutationRetryActivityArgs = {
  input: RetryActivityInput;
};


export type MutationRetryAllApiCallsArgs = {
  input: RetryAllApiCallsInput;
};


export type MutationRetryAllFailedApiCallsArgs = {
  input: RetryAllFailedApiCallsInput;
};


export type MutationRetryAllFailedWebhookCallsArgs = {
  input: RetryAllFailedWebhookCallsInput;
};


export type MutationRetryAllFailedWebhookCallsForPathwayDefinitionArgs = {
  input: RetryAllFailedWebhookCallsForPathwayDefinitionInput;
};


export type MutationRetryAllWebhookCallsArgs = {
  input: RetryAllWebhookCallsInput;
};


export type MutationRetryApiCallArgs = {
  input: RetryApiCallInput;
};


export type MutationRetryPushToEmrArgs = {
  input: RetryPushToEmrInput;
};


export type MutationRetryWebhookCallArgs = {
  input: RetryWebhookCallInput;
};


export type MutationSaveBaselineInfoArgs = {
  input: SaveBaselineInfoInput;
};


export type MutationScheduleTrackArgs = {
  input: ScheduleTrackInput;
};


export type MutationStartHostedActivitySessionArgs = {
  input: StartHostedActivitySessionInput;
};


export type MutationStartHostedActivitySessionViaHostedPagesLinkArgs = {
  input: StartHostedActivitySessionViaHostedPagesLinkInput;
};


export type MutationStartHostedPathwaySessionArgs = {
  input: StartHostedPathwaySessionInput;
};


export type MutationStartHostedPathwaySessionFromLinkArgs = {
  input: StartHostedPathwaySessionFromLinkInput;
};


export type MutationStartPathwayArgs = {
  input: StartPathwayInput;
};


export type MutationStartPathwayWithPatientIdentifierArgs = {
  input: StartPathwayWithPatientIdentifierInput;
};


export type MutationStopPathwayArgs = {
  input: StopPathwayInput;
};


export type MutationStopTrackArgs = {
  input: StopTrackInput;
};


export type MutationSubmitChecklistArgs = {
  input: SubmitChecklistInput;
};


export type MutationSubmitFormResponseArgs = {
  input: SubmitFormResponseInput;
};


export type MutationUnscheduleTracksArgs = {
  input: CancelScheduledTracksInput;
};


export type MutationUpdateBaselineInfoArgs = {
  input: UpdateBaselineInfoInput;
};


export type MutationUpdateEmrReportStatusArgs = {
  input: UpdateEmrReportStatusInput;
};


export type MutationUpdatePatientArgs = {
  input: UpdatePatientInput;
};


export type MutationUpdatePatientDemographicsQueryArgs = {
  input: UpdatePatientDemographicsQueryInput;
};


export type MutationUpdatePatientLanguageArgs = {
  input: UpdatePatientLanguageInput;
};


export type MutationVerify_IdentityArgs = {
  input: VerifyIdentityInput;
};

export type NumberArrayFilter = {
  in?: InputMaybe<Array<Scalars['Float']>>;
};

export type NumberConfig = {
  __typename?: 'NumberConfig';
  range?: Maybe<RangeConfig>;
};

export type Operand = {
  __typename?: 'Operand';
  type: ConditionOperandType;
  value: Scalars['String'];
};

export type Option = {
  __typename?: 'Option';
  id: Scalars['ID'];
  label: Scalars['String'];
  value: Scalars['Float'];
  value_string: Scalars['String'];
};

export type OrchestrationFact = {
  __typename?: 'OrchestrationFact';
  content: Array<Scalars['String']>;
  date: Scalars['String'];
  level: Scalars['String'];
  pathway_id: Scalars['String'];
};

export type OrchestrationFactsPayload = PaginationAndSortingPayload & {
  __typename?: 'OrchestrationFactsPayload';
  code: Scalars['String'];
  facts: Array<OrchestrationFact>;
  pagination?: Maybe<PaginationOutput>;
  sorting?: Maybe<SortingOutput>;
  success: Scalars['Boolean'];
};

export type OrchestrationFactsPromptPayload = Payload & {
  __typename?: 'OrchestrationFactsPromptPayload';
  code: Scalars['String'];
  response: Scalars['String'];
  success: Scalars['Boolean'];
};

export type PaginationAndSortingPayload = {
  code: Scalars['String'];
  pagination?: Maybe<PaginationOutput>;
  sorting?: Maybe<SortingOutput>;
  success: Scalars['Boolean'];
};

export type PaginationOutput = {
  __typename?: 'PaginationOutput';
  count?: Maybe<Scalars['Int']>;
  offset?: Maybe<Scalars['Int']>;
  total_count?: Maybe<Scalars['Int']>;
};

export type PaginationParams = {
  count: Scalars['Int'];
  offset: Scalars['Int'];
};

/** A care flow, also including any activities or swimlanes. Otherwise, it should be almost identical to the PathwaySummary, which is returned when retrieving a list of care flows. */
export type Pathway = {
  __typename?: 'Pathway';
  /**
   * Deprecated. Please use latestActivities.
   * @deprecated use latestActivities instead. Limited to most recent 1000 activities
   */
  activities?: Maybe<Array<Activity>>;
  complete_date?: Maybe<Scalars['SafeDate']>;
  id: Scalars['ID'];
  /** Activities, sorted by date in descending order. For larger care flows, only the most recent 1000 activities are included. To see a complete list of activities, please use the `activity` query and appropriate filters. */
  latestActivities: Array<Activity>;
  pathway_definition_id: Scalars['String'];
  patient: User;
  patient_id: Scalars['String'];
  release_id: Scalars['String'];
  start_date?: Maybe<Scalars['SafeDate']>;
  status: PathwayStatus;
  status_explanation?: Maybe<Scalars['String']>;
  stop_date?: Maybe<Scalars['SafeDate']>;
  title: Scalars['String'];
  tracks: Array<Track>;
  version?: Maybe<Scalars['Float']>;
};

export type PathwayContext = {
  __typename?: 'PathwayContext';
  action_id?: Maybe<Scalars['String']>;
  agent_id?: Maybe<Scalars['String']>;
  agent_thread_id?: Maybe<Scalars['String']>;
  instance_id: Scalars['String'];
  pathway_id: Scalars['String'];
  step_id?: Maybe<Scalars['String']>;
  track_id?: Maybe<Scalars['String']>;
};

export type PathwayDataPointDefinitionsPayload = Payload & {
  __typename?: 'PathwayDataPointDefinitionsPayload';
  code: Scalars['String'];
  data_point_definitions: Array<DataPointDefinition>;
  success: Scalars['Boolean'];
};

export type PathwayDefinitionDetails = {
  __typename?: 'PathwayDefinitionDetails';
  active_careflows?: Maybe<Scalars['Float']>;
  completed_careflows?: Maybe<Scalars['Float']>;
  stopped_careflows?: Maybe<Scalars['Float']>;
  total_careflows?: Maybe<Scalars['Float']>;
  total_patients?: Maybe<Scalars['Float']>;
};

export type PathwayFactsFilters = {
  date?: InputMaybe<DateFilter>;
  keyword?: InputMaybe<Scalars['String']>;
  pathway_id: Scalars['String'];
};

export type PathwayPayload = Payload & {
  __typename?: 'PathwayPayload';
  code: Scalars['String'];
  pathway?: Maybe<Pathway>;
  success: Scalars['Boolean'];
};

export enum PathwayStatus {
  Active = 'active',
  Completed = 'completed',
  MissingBaselineInfo = 'missing_baseline_info',
  Starting = 'starting',
  Stopped = 'stopped'
}

/** A summary of a pathway instance, excluding any activities. Useful for list views. */
export type PathwaySummary = {
  __typename?: 'PathwaySummary';
  complete_date?: Maybe<Scalars['SafeDate']>;
  id: Scalars['ID'];
  pathway_definition_id?: Maybe<Scalars['String']>;
  patient_id?: Maybe<Scalars['String']>;
  start_date?: Maybe<Scalars['SafeDate']>;
  status: PathwayStatus;
  status_explanation?: Maybe<Scalars['String']>;
  stop_date?: Maybe<Scalars['SafeDate']>;
  title: Scalars['String'];
  version?: Maybe<Scalars['Float']>;
};

export type PathwaysPayload = PaginationAndSortingPayload & {
  __typename?: 'PathwaysPayload';
  code: Scalars['String'];
  pagination?: Maybe<PaginationOutput>;
  pathways: Array<PathwaySummary>;
  sorting?: Maybe<SortingOutput>;
  success: Scalars['Boolean'];
};

export type PatientDemographicsInput = {
  patient_identifier: Scalars['String'];
};

export type PatientDemographicsPayload = Payload & {
  __typename?: 'PatientDemographicsPayload';
  code: Scalars['String'];
  entry?: Maybe<Array<UserProfile>>;
  query_id: Scalars['String'];
  status: Scalars['String'];
  success: Scalars['Boolean'];
  total?: Maybe<Scalars['Float']>;
};

export type PatientDemographicsQueryConfigurationPayload = {
  __typename?: 'PatientDemographicsQueryConfigurationPayload';
  input_box_text?: Maybe<Scalars['String']>;
  is_enabled: Scalars['Boolean'];
};

export type PatientPathway = {
  __typename?: 'PatientPathway';
  active_activities?: Maybe<Scalars['Float']>;
  baseline_info?: Maybe<Array<BaselineDataPoint>>;
  complete_date?: Maybe<Scalars['String']>;
  failed_activities?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  latest_activity_date?: Maybe<Scalars['String']>;
  latest_activity_title?: Maybe<Scalars['String']>;
  latest_activity_type?: Maybe<Scalars['String']>;
  pathway_definition_id: Scalars['String'];
  release_id: Scalars['String'];
  start_date: Scalars['String'];
  status: PathwayStatus;
  status_explanation?: Maybe<Scalars['String']>;
  stop_date?: Maybe<Scalars['String']>;
  title: Scalars['String'];
  total_activities?: Maybe<Scalars['Float']>;
  version?: Maybe<Scalars['Float']>;
};

export type PatientPathwaysPayload = Payload & {
  __typename?: 'PatientPathwaysPayload';
  code: Scalars['String'];
  patientPathways: Array<PatientPathway>;
  success: Scalars['Boolean'];
};

export type PatientPayload = Payload & {
  __typename?: 'PatientPayload';
  code: Scalars['String'];
  patient?: Maybe<User>;
  success: Scalars['Boolean'];
};

export type PatientProfileInput = {
  address?: InputMaybe<AddressInput>;
  birth_date?: InputMaybe<Scalars['String']>;
  email?: InputMaybe<Scalars['String']>;
  first_name?: InputMaybe<Scalars['String']>;
  identifier?: InputMaybe<Array<IdentifierInput>>;
  last_name?: InputMaybe<Scalars['String']>;
  /** Must be in valid E164 telephone number format */
  mobile_phone?: InputMaybe<Scalars['String']>;
  national_registry_number?: InputMaybe<Scalars['String']>;
  patient_code?: InputMaybe<Scalars['String']>;
  /** Must be a valid IANA timezone */
  patient_timezone?: InputMaybe<Scalars['String']>;
  /** Must be in valid E164 telephone number format */
  phone?: InputMaybe<Scalars['String']>;
  /** ISO 639-1 shortcode */
  preferred_language?: InputMaybe<Scalars['String']>;
  /** Sex code as defined by ISO standard IEC_5218, 0 - NOT_KNOWN, 1 - MALE, 2 - FEMALE */
  sex?: InputMaybe<Sex>;
};

export type PatientsPayload = PaginationAndSortingPayload & {
  __typename?: 'PatientsPayload';
  code: Scalars['String'];
  pagination?: Maybe<PaginationOutput>;
  patients: Array<User>;
  sorting?: Maybe<SortingOutput>;
  success: Scalars['Boolean'];
};

export type Payload = {
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type PhoneConfig = {
  __typename?: 'PhoneConfig';
  available_countries?: Maybe<Array<Scalars['String']>>;
  default_country?: Maybe<Scalars['String']>;
};

export type PluginActionSettingsProperty = {
  __typename?: 'PluginActionSettingsProperty';
  key: Scalars['String'];
  label: Scalars['String'];
  value: Scalars['String'];
};

export type PreviousAnswers = {
  __typename?: 'PreviousAnswers';
  activity_id: Scalars['ID'];
  answers: Array<Answer>;
  date: Scalars['String'];
};

export type PublishedPathwayDefinition = {
  __typename?: 'PublishedPathwayDefinition';
  active_activities?: Maybe<Scalars['Float']>;
  /** Details about the latest pathway definition */
  all?: Maybe<PathwayDefinitionDetails>;
  cancelled_activities?: Maybe<Scalars['Float']>;
  created?: Maybe<AuditTrail>;
  /**
   * Starting/baseline data point definitions for the pathway
   * @deprecated Use data_point_definitions instead
   */
  dataPointDefinitions: Array<DataPointDefinition>;
  /** Starting/baseline data point definitions for the pathway */
  data_point_definitions?: Maybe<Array<DataPointDefinition>>;
  failed_activities?: Maybe<Scalars['Float']>;
  id: Scalars['ID'];
  last_updated?: Maybe<AuditTrail>;
  /** Details about all pathway definitions */
  latest?: Maybe<PathwayDefinitionDetails>;
  patients_with_pending_activities?: Maybe<Scalars['Float']>;
  release_date?: Maybe<Scalars['String']>;
  release_id?: Maybe<Scalars['String']>;
  stakeholders_with_pending_activities_list?: Maybe<Array<Scalars['String']>>;
  title: Scalars['String'];
  total_activities?: Maybe<Scalars['Float']>;
  total_patients?: Maybe<Scalars['Float']>;
  total_stakeholders?: Maybe<Scalars['Float']>;
  /** Tracks for the pathway */
  track_definitions?: Maybe<Array<Track>>;
  version?: Maybe<Scalars['Float']>;
};

export type PublishedPathwayDefinitionsPayload = PaginationAndSortingPayload & {
  __typename?: 'PublishedPathwayDefinitionsPayload';
  code: Scalars['String'];
  pagination?: Maybe<PaginationOutput>;
  publishedPathwayDefinitions: Array<PublishedPathwayDefinition>;
  sorting?: Maybe<SortingOutput>;
  success: Scalars['Boolean'];
};

export type Query = {
  __typename?: 'Query';
  activities: ActivitiesPayload;
  activity: ActivityPayload;
  adHocTracksByPathway: TracksPayload;
  adHocTracksByRelease: TracksPayload;
  apiCall: ApiCallPayload;
  apiCalls: ApiCallsPayload;
  baselineInfo: BaselineInfoPayload;
  calculationAction: ActionPayload;
  calculationResults: CalculationResultsPayload;
  careflowActivities: ActivitiesPayload;
  careflowActivityTypes: ActivityTypesPayload;
  checklist: ChecklistPayload;
  clinicalNote: ClinicalNotePayload;
  decisionOutputs: DecisionOutputsPayload;
  emrReport: EmrReportPayload;
  extensionActivityRecord: ExtensionActivityRecordPayload;
  filterStakeholders: StakeholdersPayload;
  form: FormPayload;
  formResponse: FormResponsePayload;
  forms: FormsPayload;
  generateRetoolEmbedUrl: GenerateRetoolEmbedUrlPayload;
  getOrchestrationFactsFromPrompt: OrchestrationFactsPromptPayload;
  getPublishedCareflowVersions: CareflowVersionsPayload;
  /** Generate a signed URL for file upload to GCS */
  getSignedUrl: FileUploadGcsPayload;
  getStatusForPublishedPathwayDefinitions: PublishedPathwayDefinitionsPayload;
  hostedPagesLink: HostedPagesLinkPayload;
  hostedSession: HostedSessionPayload;
  hostedSessionActivities: HostedSessionActivitiesPayload;
  message: MessagePayload;
  myActivities: ActivitiesPayload;
  /** @deprecated Use the `pathways` query instead. */
  myPathways: PathwaysPayload;
  myPendingActivities: ActivitiesPayload;
  pathway: PathwayPayload;
  pathwayActivities: ActivitiesPayload;
  pathwayDataPointDefinitions: PathwayDataPointDefinitionsPayload;
  pathwayDataPoints: DataPointPayload;
  pathwayElements: ElementsPayload;
  pathwayFacts: OrchestrationFactsPayload;
  pathwayStepActivities: ActivitiesPayload;
  pathways: PathwaysPayload;
  patient: PatientPayload;
  patientByIdentifier: PatientPayload;
  patientDemographicsQueryConfiguration: PatientDemographicsQueryConfigurationPayload;
  patientPathways: PatientPathwaysPayload;
  patients: PatientsPayload;
  publishedPathwayDefinitions: PublishedPathwayDefinitionsPayload;
  scheduledSteps: ScheduledStepsPayload;
  scheduledTracksForPathway: ScheduledTracksPayload;
  searchPatientsByNationalRegistryNumber: SearchPatientsPayload;
  searchPatientsByPatientCode: SearchPatientsPayload;
  stakeholdersByDefinitionIds: StakeholdersPayload;
  stakeholdersByPathwayDefinitionIds: StakeholdersPayload;
  stakeholdersByReleaseIds: StakeholdersPayload;
  tenant: TenantPayload;
  webhookCall: WebhookCallPayload;
  webhookCalls: WebhookCallsPayload;
  webhookCallsForPathwayDefinition: WebhookCallsPayload;
  webhookCallsForTenant: WebhookCallsPayload;
};


export type QueryActivitiesArgs = {
  filters?: InputMaybe<FilterActivitiesParams>;
  pagination?: InputMaybe<PaginationParams>;
  sorting?: InputMaybe<SortingParams>;
};


export type QueryActivityArgs = {
  id: Scalars['String'];
};


export type QueryAdHocTracksByPathwayArgs = {
  pathway_id: Scalars['String'];
};


export type QueryAdHocTracksByReleaseArgs = {
  release_id: Scalars['String'];
};


export type QueryApiCallArgs = {
  id: Scalars['String'];
};


export type QueryApiCallsArgs = {
  pathway_id: Scalars['String'];
};


export type QueryBaselineInfoArgs = {
  pathway_id: Scalars['String'];
};


export type QueryCalculationActionArgs = {
  id: Scalars['String'];
};


export type QueryCalculationResultsArgs = {
  activity_id: Scalars['String'];
  pathway_id: Scalars['String'];
};


export type QueryCareflowActivitiesArgs = {
  filters?: InputMaybe<FilterCareflowActivitiesParams>;
  pagination?: InputMaybe<PaginationParams>;
  pathway_id: Scalars['String'];
  sorting?: InputMaybe<SortingParams>;
};


export type QueryCareflowActivityTypesArgs = {
  careflow_id: Scalars['String'];
};


export type QueryChecklistArgs = {
  id: Scalars['String'];
};


export type QueryClinicalNoteArgs = {
  id: Scalars['String'];
};


export type QueryDecisionOutputsArgs = {
  activity_id: Scalars['String'];
  pathway_id: Scalars['String'];
};


export type QueryEmrReportArgs = {
  id: Scalars['String'];
};


export type QueryExtensionActivityRecordArgs = {
  id: Scalars['String'];
};


export type QueryFilterStakeholdersArgs = {
  pathway_definition_ids?: InputMaybe<Array<Scalars['String']>>;
  release_ids?: InputMaybe<Array<Scalars['String']>>;
  stakeholder_definition_ids?: InputMaybe<Array<Scalars['String']>>;
};


export type QueryFormArgs = {
  id: Scalars['String'];
  pathway_id?: InputMaybe<Scalars['String']>;
};


export type QueryFormResponseArgs = {
  activity_id: Scalars['String'];
  pathway_id: Scalars['String'];
};


export type QueryFormsArgs = {
  pathway_definition_id: Scalars['String'];
  release_id?: InputMaybe<Scalars['String']>;
};


export type QueryGenerateRetoolEmbedUrlArgs = {
  groupIds: Array<Scalars['String']>;
  landingPageUuid: Scalars['String'];
  releaseVersion?: InputMaybe<Scalars['String']>;
  userInfo: UserInfoParams;
};


export type QueryGetOrchestrationFactsFromPromptArgs = {
  pathway_id: Scalars['String'];
  prompt: Scalars['String'];
};


export type QueryGetPublishedCareflowVersionsArgs = {
  careflow_definition_id?: InputMaybe<Scalars['String']>;
};


export type QueryGetSignedUrlArgs = {
  config_slug: Scalars['String'];
  content_type: Scalars['String'];
  expires_in?: InputMaybe<Scalars['Float']>;
  file_name: Scalars['String'];
};


export type QueryHostedPagesLinkArgs = {
  pathway_id: Scalars['String'];
  stakeholder_id: Scalars['String'];
};


export type QueryHostedSessionActivitiesArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
};


export type QueryMessageArgs = {
  id: Scalars['String'];
};


export type QueryMyActivitiesArgs = {
  pagination?: InputMaybe<PaginationParams>;
  pathway_id: Scalars['String'];
  sorting?: InputMaybe<SortingParams>;
  track_id?: InputMaybe<Scalars['String']>;
};


export type QueryPathwayArgs = {
  id: Scalars['String'];
};


export type QueryPathwayActivitiesArgs = {
  pagination?: InputMaybe<PaginationParams>;
  pathway_id: Scalars['String'];
  sorting?: InputMaybe<SortingParams>;
  track_id?: InputMaybe<Scalars['String']>;
};


export type QueryPathwayDataPointDefinitionsArgs = {
  filters?: InputMaybe<FilterPathwayDataPointDefinitionsParams>;
  pathway_definition_id?: InputMaybe<Scalars['String']>;
  release_id: Scalars['String'];
};


export type QueryPathwayDataPointsArgs = {
  activity_id?: InputMaybe<Scalars['String']>;
  data_point_definition_id?: InputMaybe<Scalars['String']>;
  data_point_key?: InputMaybe<Scalars['String']>;
  pagination?: InputMaybe<PaginationParams>;
  pathway_id: Scalars['String'];
  sorting?: InputMaybe<SortingParams>;
};


export type QueryPathwayElementsArgs = {
  pathway_id: Scalars['String'];
  track_id?: InputMaybe<Scalars['String']>;
};


export type QueryPathwayFactsArgs = {
  filters: PathwayFactsFilters;
  pagination?: InputMaybe<PaginationParams>;
  sorting?: InputMaybe<SortingParams>;
};


export type QueryPathwayStepActivitiesArgs = {
  pathway_id: Scalars['String'];
  step_id: Scalars['String'];
};


export type QueryPathwaysArgs = {
  filters?: InputMaybe<FilterPathways>;
  pagination?: InputMaybe<PaginationParams>;
  sorting?: InputMaybe<SortingParams>;
};


export type QueryPatientArgs = {
  id: Scalars['String'];
};


export type QueryPatientByIdentifierArgs = {
  system: Scalars['String'];
  value: Scalars['String'];
};


export type QueryPatientPathwaysArgs = {
  filters?: InputMaybe<FilterPatientPathways>;
  patient_id: Scalars['String'];
};


export type QueryPatientsArgs = {
  filters?: InputMaybe<FilterPatients>;
  pagination?: InputMaybe<PaginationParams>;
  sorting?: InputMaybe<SortingParams>;
};


export type QueryScheduledStepsArgs = {
  pathway_id: Scalars['String'];
};


export type QueryScheduledTracksForPathwayArgs = {
  pathway_id: Scalars['String'];
};


export type QuerySearchPatientsByNationalRegistryNumberArgs = {
  national_registry_number: Scalars['String'];
};


export type QuerySearchPatientsByPatientCodeArgs = {
  patient_code: Scalars['String'];
};


export type QueryStakeholdersByDefinitionIdsArgs = {
  stakeholder_definition_ids: Array<Scalars['String']>;
};


export type QueryStakeholdersByPathwayDefinitionIdsArgs = {
  pathway_definition_ids: Array<Scalars['String']>;
};


export type QueryStakeholdersByReleaseIdsArgs = {
  release_ids: Array<Scalars['String']>;
};


export type QueryWebhookCallArgs = {
  webhook_call_id: Scalars['String'];
};


export type QueryWebhookCallsArgs = {
  pathway_id: Scalars['String'];
};


export type QueryWebhookCallsForPathwayDefinitionArgs = {
  pathway_definition_id: Scalars['String'];
};

export type Question = {
  __typename?: 'Question';
  dataPointValueType?: Maybe<DataPointValueType>;
  definition_id: Scalars['String'];
  id: Scalars['ID'];
  key: Scalars['String'];
  metadata?: Maybe<Scalars['String']>;
  options?: Maybe<Array<Option>>;
  questionConfig?: Maybe<QuestionConfig>;
  questionType?: Maybe<QuestionType>;
  rule?: Maybe<Rule>;
  title: Scalars['String'];
  userQuestionType?: Maybe<UserQuestionType>;
};

export type QuestionConfig = {
  __typename?: 'QuestionConfig';
  date?: Maybe<DateConfig>;
  file_storage?: Maybe<FileStorageQuestionConfig>;
  input_validation?: Maybe<InputValidationConfig>;
  mandatory: Scalars['Boolean'];
  multiple_select?: Maybe<MultipleSelectConfig>;
  number?: Maybe<NumberConfig>;
  phone?: Maybe<PhoneConfig>;
  recode_enabled?: Maybe<Scalars['Boolean']>;
  slider?: Maybe<SliderConfig>;
  use_select?: Maybe<Scalars['Boolean']>;
};

export type QuestionResponseInput = {
  question_id: Scalars['String'];
  value: Scalars['String'];
};

export type QuestionRuleResult = {
  __typename?: 'QuestionRuleResult';
  question_id: Scalars['String'];
  rule_id: Scalars['String'];
  satisfied: Scalars['Boolean'];
};

export enum QuestionType {
  Input = 'INPUT',
  MultipleChoice = 'MULTIPLE_CHOICE',
  NoInput = 'NO_INPUT'
}

export type Range = {
  __typename?: 'Range';
  max?: Maybe<Scalars['Float']>;
  min?: Maybe<Scalars['Float']>;
};

export type RangeConfig = {
  __typename?: 'RangeConfig';
  enabled?: Maybe<Scalars['Boolean']>;
  max?: Maybe<Scalars['Float']>;
  min?: Maybe<Scalars['Float']>;
};

export type RetryActivityInput = {
  activity_id: Scalars['String'];
};

export type RetryAllApiCallsInput = {
  pathway_id: Scalars['String'];
};

export type RetryAllFailedApiCallsInput = {
  pathway_id: Scalars['String'];
};

export type RetryAllFailedWebhookCallsForPathwayDefinitionInput = {
  pathway_definition_id: Scalars['String'];
};

export type RetryAllFailedWebhookCallsInput = {
  pathway_id: Scalars['String'];
};

export type RetryAllWebhookCallsInput = {
  pathway_id: Scalars['String'];
};

export type RetryApiCallInput = {
  api_call_id: Scalars['String'];
};

export type RetryApiCallPayload = Payload & {
  __typename?: 'RetryApiCallPayload';
  api_call: ApiCall;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type RetryPushToEmrInput = {
  activity_id: Scalars['String'];
};

export type RetryWebhookCallInput = {
  webhook_call_id: Scalars['String'];
};

export type RetryWebhookCallPayload = Payload & {
  __typename?: 'RetryWebhookCallPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  webhook_call: WebhookCall;
};

export type Rule = {
  __typename?: 'Rule';
  boolean_operator: BooleanOperator;
  conditions: Array<Condition>;
  definition_id?: Maybe<Scalars['String']>;
  id: Scalars['ID'];
};

export type SaveBaselineInfoInput = {
  baseline_info: Array<BaselineInfoInput>;
  pathway_id: Scalars['String'];
};

export type ScheduleTrackInput = {
  cancel_any_scheduled?: InputMaybe<Scalars['Boolean']>;
  pathway_id: Scalars['String'];
  scheduled_date: Scalars['String'];
  track_id: Scalars['String'];
};

export type ScheduleTrackPayload = Payload & {
  __typename?: 'ScheduleTrackPayload';
  code: Scalars['String'];
  id: Scalars['String'];
  success: Scalars['Boolean'];
};

export type ScheduledStepsPayload = Payload & {
  __typename?: 'ScheduledStepsPayload';
  code: Scalars['String'];
  steps: Array<Element>;
  success: Scalars['Boolean'];
};

export type ScheduledTrack = {
  __typename?: 'ScheduledTrack';
  created_by_user_id: Scalars['String'];
  created_date: Scalars['String'];
  id: Scalars['ID'];
  modified_date?: Maybe<Scalars['String']>;
  pathway_id: Scalars['String'];
  release_id: Scalars['String'];
  scheduled_date: Scalars['String'];
  status: Scalars['String'];
  tenant_id: Scalars['String'];
  title: Scalars['String'];
  track_definition_id: Scalars['String'];
};

export type ScheduledTracksPayload = Payload & {
  __typename?: 'ScheduledTracksPayload';
  code: Scalars['String'];
  scheduled_tracks: Array<ScheduledTrack>;
  success: Scalars['Boolean'];
};

export type SearchPatientsPayload = Payload & {
  __typename?: 'SearchPatientsPayload';
  code: Scalars['String'];
  patients: Array<User>;
  success: Scalars['Boolean'];
};

export type SessionMetadata = {
  __typename?: 'SessionMetadata';
  pathway_definition_id?: Maybe<Scalars['String']>;
  tenant_id?: Maybe<Scalars['String']>;
};

export enum Sex {
  Female = 'FEMALE',
  Male = 'MALE',
  NotKnown = 'NOT_KNOWN'
}

export type SingleCalculationResult = {
  __typename?: 'SingleCalculationResult';
  status?: Maybe<Scalars['String']>;
  subresult_id: Scalars['String'];
  unit?: Maybe<Scalars['String']>;
  value: Scalars['String'];
  value_type?: Maybe<DataPointValueType>;
};

export type SliderConfig = {
  __typename?: 'SliderConfig';
  display_marks: Scalars['Boolean'];
  is_value_tooltip_on: Scalars['Boolean'];
  max: Scalars['Float'];
  max_label: Scalars['String'];
  min: Scalars['Float'];
  min_label: Scalars['String'];
  show_min_max_values: Scalars['Boolean'];
  step_value: Scalars['Float'];
};

export type SortingOutput = {
  __typename?: 'SortingOutput';
  direction: Scalars['String'];
  field: Scalars['String'];
};

export type SortingParams = {
  direction: Scalars['String'];
  field: Scalars['String'];
};

export type Stakeholder = {
  __typename?: 'Stakeholder';
  clinical_app_role: StakeholderClinicalAppRole;
  definition_id: Scalars['String'];
  id: Scalars['ID'];
  label: StakeholderLabel;
  release_id: Scalars['String'];
  version: Scalars['Float'];
};

export enum StakeholderClinicalAppRole {
  Caregiver = 'CAREGIVER',
  Patient = 'PATIENT',
  Physician = 'PHYSICIAN'
}

export type StakeholderLabel = {
  __typename?: 'StakeholderLabel';
  en: Scalars['String'];
};

export type StakeholdersPayload = Payload & {
  __typename?: 'StakeholdersPayload';
  code: Scalars['String'];
  stakeholders: Array<Stakeholder>;
  success: Scalars['Boolean'];
};

export type StartHostedActivitySessionInput = {
  cancel_url?: InputMaybe<Scalars['String']>;
  /** ISO 639-1 shortcode */
  language?: InputMaybe<Scalars['String']>;
  pathway_id: Scalars['String'];
  stakeholder_id: Scalars['String'];
  success_url?: InputMaybe<Scalars['String']>;
  user_context?: InputMaybe<HostedSessionUserContextInput>;
};

export type StartHostedActivitySessionPayload = Payload & {
  __typename?: 'StartHostedActivitySessionPayload';
  code: Scalars['String'];
  language?: Maybe<Scalars['String']>;
  session_id: Scalars['String'];
  session_url: Scalars['String'];
  success: Scalars['Boolean'];
  user_context?: Maybe<HostedSessionUserContext>;
};

export type StartHostedActivitySessionViaHostedPagesLinkInput = {
  hosted_pages_link_id: Scalars['String'];
};

export type StartHostedPathwaySessionFromLinkInput = {
  id: Scalars['String'];
  patient_identifier?: InputMaybe<IdentifierInput>;
};

export type StartHostedPathwaySessionFromLinkPayload = Payload & {
  __typename?: 'StartHostedPathwaySessionFromLinkPayload';
  code: Scalars['String'];
  session_url: Scalars['String'];
  success: Scalars['Boolean'];
};

export type StartHostedPathwaySessionInput = {
  cancel_url?: InputMaybe<Scalars['String']>;
  data_points?: InputMaybe<Array<DataPointInput>>;
  /** ISO 639-1 shortcode */
  language?: InputMaybe<Scalars['String']>;
  pathway_definition_id: Scalars['String'];
  /** Unique id of the patient in Awell, if not provided, patient identifier will be tried to uniquely identify the patient. */
  patient_id?: InputMaybe<Scalars['String']>;
  /** If no patient_id is provided this field will be used to uniquely identify the patient. */
  patient_identifier?: InputMaybe<IdentifierInput>;
  /** Specify the stakeholder for the hosted session. If not provided, the stakeholder will be the patient by default */
  stakeholder_definition_id?: InputMaybe<Scalars['String']>;
  success_url?: InputMaybe<Scalars['String']>;
  /** Time-to-live of the session in seconds. This defaults to the maximal value of 3600 seconds (one hour). */
  ttl?: InputMaybe<Scalars['Float']>;
  user_context?: InputMaybe<HostedSessionUserContextInput>;
};

export type StartHostedPathwaySessionPayload = Payload & {
  __typename?: 'StartHostedPathwaySessionPayload';
  code: Scalars['String'];
  pathway_id: Scalars['String'];
  session_id: Scalars['String'];
  session_url: Scalars['String'];
  stakeholder: HostedSessionStakeholder;
  success: Scalars['Boolean'];
  user_context?: Maybe<HostedSessionUserContext>;
};

export type StartPathwayInput = {
  data_points?: InputMaybe<Array<DataPointInput>>;
  pathway_definition_id: Scalars['String'];
  patient_id: Scalars['String'];
  release_id?: InputMaybe<Scalars['String']>;
};

export type StartPathwayPayload = Payload & {
  __typename?: 'StartPathwayPayload';
  code: Scalars['String'];
  pathway_id: Scalars['String'];
  stakeholders: Array<Stakeholder>;
  success: Scalars['Boolean'];
};

export type StartPathwayWithPatientIdentifierInput = {
  data_points?: InputMaybe<Array<DataPointInput>>;
  pathway_definition_id: Scalars['String'];
  patient_identifier: IdentifierInput;
  release_id?: InputMaybe<Scalars['String']>;
};

export type StartPathwayWithPatientIdentifierPayload = Payload & {
  __typename?: 'StartPathwayWithPatientIdentifierPayload';
  code: Scalars['String'];
  pathway_id: Scalars['String'];
  patient_id: Scalars['String'];
  stakeholders: Array<Stakeholder>;
  success: Scalars['Boolean'];
};

export type StopPathwayInput = {
  pathway_id: Scalars['String'];
  reason?: InputMaybe<Scalars['String']>;
};

export type StopTrackInput = {
  pathway_id: Scalars['String'];
  track_id: Scalars['String'];
};

export type StopTrackPayload = Payload & {
  __typename?: 'StopTrackPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  track: Element;
};

export type StringArrayFilter = {
  in?: InputMaybe<Array<Scalars['String']>>;
};

export type SubActivity = {
  __typename?: 'SubActivity';
  action: ActivityAction;
  date: Scalars['String'];
  error?: Maybe<Scalars['String']>;
  error_category?: Maybe<Scalars['String']>;
  id: Scalars['String'];
  object?: Maybe<ActivityObject>;
  scheduled_date?: Maybe<Scalars['String']>;
  subject: ActivitySubject;
  text?: Maybe<TranslatedText>;
};

export type SubmitChecklistInput = {
  activity_id: Scalars['String'];
};

export type SubmitChecklistPayload = Payload & {
  __typename?: 'SubmitChecklistPayload';
  activity: Activity;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type SubmitFormResponseInput = {
  activity_id: Scalars['String'];
  response: Array<QuestionResponseInput>;
};

export type SubmitFormResponsePayload = Payload & {
  __typename?: 'SubmitFormResponsePayload';
  activity: Activity;
  code: Scalars['String'];
  success: Scalars['Boolean'];
};

export type Subscription = {
  __typename?: 'Subscription';
  activityCompleted: Activity;
  activityCreated: Activity;
  activityExpired: Activity;
  activityUpdated: Activity;
  apiCallCreated: ApiCall;
  apiCallUpdated: ApiCall;
  elementCompleted: Element;
  elementCreated: Element;
  elementUpdated: Element;
  pathwayUpdated: Pathway;
  sessionActivityCompleted: Activity;
  sessionActivityCreated: Activity;
  sessionActivityExpired: Activity;
  sessionActivityUpdated: Activity;
  sessionCompleted: HostedSession;
  sessionExpired: HostedSession;
  webhookCallCreated: WebhookCall;
  webhookCallUpdated: WebhookCall;
};


export type SubscriptionActivityCompletedArgs = {
  only_patient_activities?: InputMaybe<Scalars['Boolean']>;
  pathway_id?: InputMaybe<Scalars['String']>;
};


export type SubscriptionActivityCreatedArgs = {
  only_patient_activities?: InputMaybe<Scalars['Boolean']>;
  pathway_id?: InputMaybe<Scalars['String']>;
};


export type SubscriptionActivityExpiredArgs = {
  only_patient_activities?: InputMaybe<Scalars['Boolean']>;
  pathway_id?: InputMaybe<Scalars['String']>;
};


export type SubscriptionActivityUpdatedArgs = {
  only_patient_activities?: InputMaybe<Scalars['Boolean']>;
  pathway_id?: InputMaybe<Scalars['String']>;
};


export type SubscriptionApiCallCreatedArgs = {
  pathway_id: Scalars['String'];
};


export type SubscriptionApiCallUpdatedArgs = {
  pathway_id: Scalars['String'];
};


export type SubscriptionElementCompletedArgs = {
  element_type?: InputMaybe<ElementType>;
  pathway_id: Scalars['String'];
};


export type SubscriptionElementCreatedArgs = {
  element_type?: InputMaybe<ElementType>;
  pathway_id: Scalars['String'];
};


export type SubscriptionElementUpdatedArgs = {
  element_type?: InputMaybe<ElementType>;
  pathway_id: Scalars['String'];
};


export type SubscriptionPathwayUpdatedArgs = {
  id: Scalars['ID'];
};


export type SubscriptionSessionActivityCompletedArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
};


export type SubscriptionSessionActivityCreatedArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
};


export type SubscriptionSessionActivityExpiredArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
};


export type SubscriptionSessionActivityUpdatedArgs = {
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
};


export type SubscriptionWebhookCallCreatedArgs = {
  pathway_id: Scalars['String'];
};


export type SubscriptionWebhookCallUpdatedArgs = {
  pathway_id: Scalars['String'];
};

export type Tenant = {
  __typename?: 'Tenant';
  accent_color: Scalars['String'];
  hosted_page_title: Scalars['String'];
  identifier_systems?: Maybe<Array<IdentifierSystem>>;
  is_default: Scalars['Boolean'];
  logo_path: Scalars['String'];
  name: Scalars['String'];
};

export type TenantPayload = Payload & {
  __typename?: 'TenantPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  tenant: Tenant;
};

export type TextFilter = {
  contains?: InputMaybe<Scalars['String']>;
  eq?: InputMaybe<Scalars['String']>;
};

export type TextFilterContains = {
  contains?: InputMaybe<Scalars['String']>;
};

export type TextFilterEquals = {
  eq?: InputMaybe<Scalars['String']>;
};

export type Track = {
  __typename?: 'Track';
  /** Whether the track can be triggered manually (i.e. via addTrack or scheduleTrack mutations) */
  can_trigger_manually?: Maybe<Scalars['Boolean']>;
  /** The definition ID of the Track, can be used for adding or scheduling */
  id: Scalars['ID'];
  release_id?: Maybe<Scalars['String']>;
  title: Scalars['String'];
};

export type TracksPayload = Payload & {
  __typename?: 'TracksPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  tracks: Array<Track>;
};

export type TranslatedText = {
  __typename?: 'TranslatedText';
  en?: Maybe<Scalars['String']>;
};

export type UpdateBaselineInfoInput = {
  baseline_info: Array<BaselineInfoInput>;
  pathway_id: Scalars['String'];
};

export type UpdateEmrReportStatusInput = {
  reason: Scalars['String'];
  request_id: Scalars['String'];
  status: Scalars['String'];
};

export type UpdateEmrReportStatusPayload = Payload & {
  __typename?: 'UpdateEmrReportStatusPayload';
  code: Scalars['String'];
  request?: Maybe<EmrRequest>;
  success: Scalars['Boolean'];
};

export type UpdatePatientDemographicsQueryInput = {
  /** Index from the array returned from the PDQ response, which was used to create the patient */
  created_patient_entry_index: Scalars['Float'];
  /** Patient ID of the created patient in Awell */
  created_patient_id: Scalars['String'];
  query_id: Scalars['String'];
};

export type UpdatePatientDemographicsQueryPayload = Payload & {
  __typename?: 'UpdatePatientDemographicsQueryPayload';
  code: Scalars['String'];
  created_patient_entry_index: Scalars['Float'];
  created_patient_id: Scalars['String'];
  success: Scalars['Boolean'];
};

export type UpdatePatientInput = {
  patient_id: Scalars['String'];
  profile: PatientProfileInput;
};

export type UpdatePatientLanguageInput = {
  /** ISO 639-1 shortcode */
  preferred_language: Scalars['String'];
};

export type UpdatePatientLanguagePayload = Payload & {
  __typename?: 'UpdatePatientLanguagePayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  user?: Maybe<User>;
};

export type UpdatePatientPayload = Payload & {
  __typename?: 'UpdatePatientPayload';
  code: Scalars['String'];
  patient?: Maybe<User>;
  success: Scalars['Boolean'];
};

export type User = {
  __typename?: 'User';
  id: Scalars['ID'];
  profile?: Maybe<UserProfile>;
  tenant_id: Scalars['String'];
};

export type UserInfoParams = {
  email: Scalars['String'];
  firstName: Scalars['String'];
  id: Scalars['String'];
  lastName: Scalars['String'];
};

export type UserProfile = {
  __typename?: 'UserProfile';
  address?: Maybe<Address>;
  birth_date?: Maybe<Scalars['String']>;
  email?: Maybe<Scalars['String']>;
  first_name?: Maybe<Scalars['String']>;
  identifier?: Maybe<Array<Identifier>>;
  last_name?: Maybe<Scalars['String']>;
  mobile_phone?: Maybe<Scalars['String']>;
  name?: Maybe<Scalars['String']>;
  national_registry_number?: Maybe<Scalars['String']>;
  patient_code?: Maybe<Scalars['String']>;
  patient_timezone?: Maybe<Scalars['String']>;
  phone?: Maybe<Scalars['String']>;
  preferred_language?: Maybe<Scalars['String']>;
  /** Sex code as defined by ISO standard IEC_5218, 0 - NOT_KNOWN, 1 - MALE, 2 - FEMALE */
  sex?: Maybe<Sex>;
};

export enum UserQuestionType {
  Date = 'DATE',
  Description = 'DESCRIPTION',
  Email = 'EMAIL',
  File = 'FILE',
  Icd10Classification = 'ICD10_CLASSIFICATION',
  Image = 'IMAGE',
  LongText = 'LONG_TEXT',
  MultipleChoice = 'MULTIPLE_CHOICE',
  MultipleChoiceGrid = 'MULTIPLE_CHOICE_GRID',
  MultipleSelect = 'MULTIPLE_SELECT',
  Number = 'NUMBER',
  ShortText = 'SHORT_TEXT',
  Signature = 'SIGNATURE',
  Slider = 'SLIDER',
  Telephone = 'TELEPHONE',
  YesNo = 'YES_NO'
}

export type VerifyIdentityInput = {
  dob?: InputMaybe<Scalars['String']>;
  pathway_id: Scalars['String'];
};

export type WebhookCall = {
  __typename?: 'WebhookCall';
  created_at: Scalars['String'];
  event_type: Scalars['String'];
  id: Scalars['ID'];
  pathway?: Maybe<ApiPathwayContext>;
  request: WebhookCallRequest;
  responses: Array<WebhookCallResponse>;
  status: Scalars['String'];
  webhook_id: Scalars['String'];
  webhook_name: Scalars['String'];
};

export type WebhookCallHeader = {
  __typename?: 'WebhookCallHeader';
  key: Scalars['String'];
  value: Scalars['String'];
};

export type WebhookCallPayload = Payload & {
  __typename?: 'WebhookCallPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  webhook_call: WebhookCall;
};

export type WebhookCallRequest = {
  __typename?: 'WebhookCallRequest';
  body: Scalars['String'];
  endpoint: Scalars['String'];
  headers: Array<WebhookCallHeader>;
  method: Scalars['String'];
};

export type WebhookCallResponse = {
  __typename?: 'WebhookCallResponse';
  body: Scalars['String'];
  date: Scalars['String'];
  status: Scalars['Float'];
};

export type WebhookCallsPayload = Payload & {
  __typename?: 'WebhookCallsPayload';
  code: Scalars['String'];
  success: Scalars['Boolean'];
  webhook_calls: Array<WebhookCall>;
};

export type GetChecklistQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetChecklistQuery = { __typename?: 'Query', checklist: { __typename?: 'ChecklistPayload', checklist?: { __typename?: 'Checklist', title: string, items: Array<string> } | null } };

export type CompleteExtensionActivityMutationVariables = Exact<{
  input: CompleteExtensionActivityInput;
}>;


export type CompleteExtensionActivityMutation = { __typename?: 'Mutation', completeExtensionActivity: { __typename?: 'CompleteExtensionActivityPayload', activity: { __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null } } };

export type EvaluateFormRulesMutationVariables = Exact<{
  input: EvaluateFormRulesInput;
}>;


export type EvaluateFormRulesMutation = { __typename?: 'Mutation', evaluateFormRules: { __typename?: 'EvaluateFormRulesPayload', results: Array<{ __typename?: 'QuestionRuleResult', question_id: string, rule_id: string, satisfied: boolean }> } };

export type GetExtensionActivityDetailsQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetExtensionActivityDetailsQuery = { __typename?: 'Query', extensionActivityRecord: { __typename?: 'ExtensionActivityRecordPayload', record: { __typename?: 'ExtensionActivityRecord', id: string, activity_id: string, pathway_id: string, plugin_key: string, plugin_action_key: string, date: string, data_points: Array<{ __typename?: 'ExtensionDataPoint', label: string, value: string }>, fields: Array<{ __typename?: 'ExtensionActionField', id: string, type: ExtensionActionFieldType, label: string, value: string }>, settings?: Array<{ __typename?: 'PluginActionSettingsProperty', value: string, label: string, key: string }> | null } } };

export type GetSignedUrlQueryVariables = Exact<{
  content_type: Scalars['String'];
  expires_in?: InputMaybe<Scalars['Float']>;
  file_name: Scalars['String'];
  config_slug: Scalars['String'];
}>;


export type GetSignedUrlQuery = { __typename?: 'Query', getSignedUrl: { __typename?: 'FileUploadGCSPayload', upload_url: string, file_url: string } };

export type FormFragment = { __typename?: 'Form', id: string, key: string, title: string, trademark?: string | null, definition_id: string, release_id: string, questions: Array<{ __typename?: 'Question', id: string, definition_id: string, key: string, title: string, dataPointValueType?: DataPointValueType | null, questionType?: QuestionType | null, userQuestionType?: UserQuestionType | null, options?: Array<{ __typename?: 'Option', id: string, value_string: string, value: number, label: string }> | null, questionConfig?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, mandatory: boolean, use_select?: boolean | null, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, display_marks: boolean, min_label: string, max_label: string, is_value_tooltip_on: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', min?: number | null, max?: number | null, enabled?: boolean | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', min?: number | null, max?: number | null, enabled?: boolean | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', option_id?: string | null, enabled?: boolean | null } | null } | null, date?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null } | null }> };

export type GetFormQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetFormQuery = { __typename?: 'Query', form: { __typename?: 'FormPayload', form?: { __typename?: 'Form', id: string, key: string, title: string, trademark?: string | null, definition_id: string, release_id: string, questions: Array<{ __typename?: 'Question', id: string, definition_id: string, key: string, title: string, dataPointValueType?: DataPointValueType | null, questionType?: QuestionType | null, userQuestionType?: UserQuestionType | null, options?: Array<{ __typename?: 'Option', id: string, value_string: string, value: number, label: string }> | null, questionConfig?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, mandatory: boolean, use_select?: boolean | null, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, display_marks: boolean, min_label: string, max_label: string, is_value_tooltip_on: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', min?: number | null, max?: number | null, enabled?: boolean | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', min?: number | null, max?: number | null, enabled?: boolean | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', option_id?: string | null, enabled?: boolean | null } | null } | null, date?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null } | null }> } | null } };

export type GetFormResponseQueryVariables = Exact<{
  pathway_id: Scalars['String'];
  activity_id: Scalars['String'];
}>;


export type GetFormResponseQuery = { __typename?: 'Query', formResponse: { __typename?: 'FormResponsePayload', response: { __typename?: 'FormResponse', answers: Array<{ __typename?: 'Answer', question_id: string, value: string, value_type: DataPointValueType }> } } };

export type QuestionFragment = { __typename?: 'Question', id: string, definition_id: string, key: string, title: string, dataPointValueType?: DataPointValueType | null, questionType?: QuestionType | null, userQuestionType?: UserQuestionType | null, options?: Array<{ __typename?: 'Option', id: string, value_string: string, value: number, label: string }> | null, questionConfig?: { __typename?: 'QuestionConfig', recode_enabled?: boolean | null, mandatory: boolean, use_select?: boolean | null, slider?: { __typename?: 'SliderConfig', min: number, max: number, step_value: number, display_marks: boolean, min_label: string, max_label: string, is_value_tooltip_on: boolean, show_min_max_values: boolean } | null, phone?: { __typename?: 'PhoneConfig', default_country?: string | null, available_countries?: Array<string> | null } | null, number?: { __typename?: 'NumberConfig', range?: { __typename?: 'RangeConfig', min?: number | null, max?: number | null, enabled?: boolean | null } | null } | null, multiple_select?: { __typename?: 'MultipleSelectConfig', range?: { __typename?: 'ChoiceRangeConfig', min?: number | null, max?: number | null, enabled?: boolean | null } | null, exclusive_option?: { __typename?: 'ExclusiveOptionConfig', option_id?: string | null, enabled?: boolean | null } | null } | null, date?: { __typename?: 'DateConfig', allowed_dates?: AllowedDatesOptions | null, include_date_of_response?: boolean | null } | null, file_storage?: { __typename?: 'FileStorageQuestionConfig', file_storage_config_slug?: string | null, accepted_file_types?: Array<string> | null } | null } | null };

export type HostedSessionFragment = { __typename?: 'HostedSession', id: string, pathway_id: string, status: HostedSessionStatus, success_url?: string | null, cancel_url?: string | null, stakeholder: { __typename?: 'HostedSessionStakeholder', id: string, type: HostedSessionStakeholderType, name: string } };

export type OnHostedSessionCompletedSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnHostedSessionCompletedSubscription = { __typename?: 'Subscription', sessionCompleted: { __typename?: 'HostedSession', id: string, pathway_id: string, status: HostedSessionStatus, success_url?: string | null, cancel_url?: string | null, stakeholder: { __typename?: 'HostedSessionStakeholder', id: string, type: HostedSessionStakeholderType, name: string } } };

export type OnHostedSessionExpiredSubscriptionVariables = Exact<{ [key: string]: never; }>;


export type OnHostedSessionExpiredSubscription = { __typename?: 'Subscription', sessionExpired: { __typename?: 'HostedSession', id: string, pathway_id: string, status: HostedSessionStatus, success_url?: string | null, cancel_url?: string | null, stakeholder: { __typename?: 'HostedSessionStakeholder', id: string, type: HostedSessionStakeholderType, name: string } } };

export type GetHostedSessionQueryVariables = Exact<{ [key: string]: never; }>;


export type GetHostedSessionQuery = { __typename?: 'Query', hostedSession: { __typename?: 'HostedSessionPayload', session: { __typename?: 'HostedSession', id: string, pathway_id: string, status: HostedSessionStatus, success_url?: string | null, cancel_url?: string | null, stakeholder: { __typename?: 'HostedSessionStakeholder', id: string, type: HostedSessionStakeholderType, name: string } }, branding?: { __typename?: 'BrandingSettings', logo_url?: string | null, hosted_page_title?: string | null, accent_color?: string | null, hosted_page_auto_progress?: boolean | null, hosted_page_autosave?: boolean | null, custom_theme?: string | null } | null, metadata?: { __typename?: 'SessionMetadata', pathway_definition_id?: string | null, tenant_id?: string | null } | null } };

export type GetMessageQueryVariables = Exact<{
  id: Scalars['String'];
}>;


export type GetMessageQuery = { __typename?: 'Query', message: { __typename?: 'MessagePayload', message?: { __typename?: 'Message', id: string, body: string, subject?: string | null, format?: MessageFormat | null, attachments?: Array<{ __typename?: 'MessageAttachment', id: string, name: string, type: MessageAttachmentType, url: string }> | null } | null } };

export type MarkMessageAsReadMutationVariables = Exact<{
  input: MarkMessageAsReadInput;
}>;


export type MarkMessageAsReadMutation = { __typename?: 'Mutation', markMessageAsRead: { __typename?: 'MarkMessageAsReadPayload', activity: { __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null } } };

export type ActivityFragment = { __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null };

export type GetHostedSessionActivitiesQueryVariables = Exact<{
  only_stakeholder_activities?: InputMaybe<Scalars['Boolean']>;
}>;


export type GetHostedSessionActivitiesQuery = { __typename?: 'Query', hostedSessionActivities: { __typename?: 'HostedSessionActivitiesPayload', success: boolean, activities: Array<{ __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null }> } };

export type OnSessionActivityCompletedSubscriptionVariables = Exact<{
  only_stakeholder_activities: Scalars['Boolean'];
}>;


export type OnSessionActivityCompletedSubscription = { __typename?: 'Subscription', sessionActivityCompleted: { __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null } };

export type OnSessionActivityCreatedSubscriptionVariables = Exact<{
  only_stakeholder_activities: Scalars['Boolean'];
}>;


export type OnSessionActivityCreatedSubscription = { __typename?: 'Subscription', sessionActivityCreated: { __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null } };

export type OnSessionActivityExpiredSubscriptionVariables = Exact<{
  only_stakeholder_activities: Scalars['Boolean'];
}>;


export type OnSessionActivityExpiredSubscription = { __typename?: 'Subscription', sessionActivityExpired: { __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null } };

export type OnSessionActivityUpdatedSubscriptionVariables = Exact<{
  only_stakeholder_activities: Scalars['Boolean'];
}>;


export type OnSessionActivityUpdatedSubscription = { __typename?: 'Subscription', sessionActivityUpdated: { __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null } };

export type SubmitChecklistMutationVariables = Exact<{
  input: SubmitChecklistInput;
}>;


export type SubmitChecklistMutation = { __typename?: 'Mutation', submitChecklist: { __typename?: 'SubmitChecklistPayload', activity: { __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null } } };

export type SubmitFormResponseMutationVariables = Exact<{
  input: SubmitFormResponseInput;
}>;


export type SubmitFormResponseMutation = { __typename?: 'Mutation', submitFormResponse: { __typename?: 'SubmitFormResponsePayload', activity: { __typename?: 'Activity', id: string, date: string, status: ActivityStatus, form_display_mode?: FormDisplayMode | null, object: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string }, indirect_object?: { __typename?: 'ActivityObject', id: string, type: ActivityObjectType, name: string } | null, action_component?: { __typename?: 'ActionComponent', definition_id?: string | null, release_id?: string | null, title?: string | null } | null, context?: { __typename?: 'PathwayContext', track_id?: string | null } | null } } };

export const QuestionFragmentDoc = gql`
    fragment Question on Question {
  id
  definition_id
  key
  title
  dataPointValueType
  options {
    id
    value_string
    value
    label
  }
  questionType
  userQuestionType
  questionConfig {
    recode_enabled
    mandatory
    use_select
    slider {
      min
      max
      step_value
      display_marks
      min_label
      max_label
      is_value_tooltip_on
      show_min_max_values
    }
    phone {
      default_country
      available_countries
    }
    number {
      range {
        min
        max
        enabled
      }
    }
    multiple_select {
      range {
        min
        max
        enabled
      }
      exclusive_option {
        option_id
        enabled
      }
    }
    date {
      allowed_dates
      include_date_of_response
    }
    file_storage {
      file_storage_config_slug
      accepted_file_types
    }
  }
}
    `;
export const FormFragmentDoc = gql`
    fragment Form on Form {
  id
  key
  title
  trademark
  definition_id
  release_id
  questions {
    ...Question
  }
}
    ${QuestionFragmentDoc}`;
export const HostedSessionFragmentDoc = gql`
    fragment HostedSession on HostedSession {
  id
  pathway_id
  status
  success_url
  cancel_url
  stakeholder {
    id
    type
    name
  }
}
    `;
export const ActivityFragmentDoc = gql`
    fragment Activity on Activity {
  id
  date
  status
  form_display_mode
  object {
    id
    type
    name
  }
  indirect_object {
    id
    type
    name
  }
  action_component {
    definition_id
    release_id
    title
  }
  context {
    track_id
  }
}
    `;
export const GetChecklistDocument = gql`
    query GetChecklist($id: String!) {
  checklist(id: $id) {
    checklist {
      title
      items
    }
  }
}
    `;

/**
 * __useGetChecklistQuery__
 *
 * To run a query within a React component, call `useGetChecklistQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetChecklistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetChecklistQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetChecklistQuery(baseOptions: Apollo.QueryHookOptions<GetChecklistQuery, GetChecklistQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetChecklistQuery, GetChecklistQueryVariables>(GetChecklistDocument, options);
      }
export function useGetChecklistLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetChecklistQuery, GetChecklistQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetChecklistQuery, GetChecklistQueryVariables>(GetChecklistDocument, options);
        }
export type GetChecklistQueryHookResult = ReturnType<typeof useGetChecklistQuery>;
export type GetChecklistLazyQueryHookResult = ReturnType<typeof useGetChecklistLazyQuery>;
export type GetChecklistQueryResult = Apollo.QueryResult<GetChecklistQuery, GetChecklistQueryVariables>;
export const CompleteExtensionActivityDocument = gql`
    mutation CompleteExtensionActivity($input: CompleteExtensionActivityInput!) {
  completeExtensionActivity(input: $input) {
    activity {
      ...Activity
    }
  }
}
    ${ActivityFragmentDoc}`;
export type CompleteExtensionActivityMutationFn = Apollo.MutationFunction<CompleteExtensionActivityMutation, CompleteExtensionActivityMutationVariables>;

/**
 * __useCompleteExtensionActivityMutation__
 *
 * To run a mutation, you first call `useCompleteExtensionActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCompleteExtensionActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [completeExtensionActivityMutation, { data, loading, error }] = useCompleteExtensionActivityMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCompleteExtensionActivityMutation(baseOptions?: Apollo.MutationHookOptions<CompleteExtensionActivityMutation, CompleteExtensionActivityMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CompleteExtensionActivityMutation, CompleteExtensionActivityMutationVariables>(CompleteExtensionActivityDocument, options);
      }
export type CompleteExtensionActivityMutationHookResult = ReturnType<typeof useCompleteExtensionActivityMutation>;
export type CompleteExtensionActivityMutationResult = Apollo.MutationResult<CompleteExtensionActivityMutation>;
export type CompleteExtensionActivityMutationOptions = Apollo.BaseMutationOptions<CompleteExtensionActivityMutation, CompleteExtensionActivityMutationVariables>;
export const EvaluateFormRulesDocument = gql`
    mutation EvaluateFormRules($input: EvaluateFormRulesInput!) {
  evaluateFormRules(input: $input) {
    results {
      question_id
      rule_id
      satisfied
    }
  }
}
    `;
export type EvaluateFormRulesMutationFn = Apollo.MutationFunction<EvaluateFormRulesMutation, EvaluateFormRulesMutationVariables>;

/**
 * __useEvaluateFormRulesMutation__
 *
 * To run a mutation, you first call `useEvaluateFormRulesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useEvaluateFormRulesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [evaluateFormRulesMutation, { data, loading, error }] = useEvaluateFormRulesMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useEvaluateFormRulesMutation(baseOptions?: Apollo.MutationHookOptions<EvaluateFormRulesMutation, EvaluateFormRulesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<EvaluateFormRulesMutation, EvaluateFormRulesMutationVariables>(EvaluateFormRulesDocument, options);
      }
export type EvaluateFormRulesMutationHookResult = ReturnType<typeof useEvaluateFormRulesMutation>;
export type EvaluateFormRulesMutationResult = Apollo.MutationResult<EvaluateFormRulesMutation>;
export type EvaluateFormRulesMutationOptions = Apollo.BaseMutationOptions<EvaluateFormRulesMutation, EvaluateFormRulesMutationVariables>;
export const GetExtensionActivityDetailsDocument = gql`
    query GetExtensionActivityDetails($id: String!) {
  extensionActivityRecord(id: $id) {
    record {
      id
      activity_id
      pathway_id
      data_points {
        label
        value
      }
      plugin_key
      plugin_action_key
      fields {
        id
        type
        label
        value
      }
      date
      settings {
        value
        label
        key
      }
    }
  }
}
    `;

/**
 * __useGetExtensionActivityDetailsQuery__
 *
 * To run a query within a React component, call `useGetExtensionActivityDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExtensionActivityDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExtensionActivityDetailsQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetExtensionActivityDetailsQuery(baseOptions: Apollo.QueryHookOptions<GetExtensionActivityDetailsQuery, GetExtensionActivityDetailsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExtensionActivityDetailsQuery, GetExtensionActivityDetailsQueryVariables>(GetExtensionActivityDetailsDocument, options);
      }
export function useGetExtensionActivityDetailsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExtensionActivityDetailsQuery, GetExtensionActivityDetailsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExtensionActivityDetailsQuery, GetExtensionActivityDetailsQueryVariables>(GetExtensionActivityDetailsDocument, options);
        }
export type GetExtensionActivityDetailsQueryHookResult = ReturnType<typeof useGetExtensionActivityDetailsQuery>;
export type GetExtensionActivityDetailsLazyQueryHookResult = ReturnType<typeof useGetExtensionActivityDetailsLazyQuery>;
export type GetExtensionActivityDetailsQueryResult = Apollo.QueryResult<GetExtensionActivityDetailsQuery, GetExtensionActivityDetailsQueryVariables>;
export const GetSignedUrlDocument = gql`
    query GetSignedUrl($content_type: String!, $expires_in: Float, $file_name: String!, $config_slug: String!) {
  getSignedUrl(
    content_type: $content_type
    expires_in: $expires_in
    file_name: $file_name
    config_slug: $config_slug
  ) {
    upload_url
    file_url
  }
}
    `;

/**
 * __useGetSignedUrlQuery__
 *
 * To run a query within a React component, call `useGetSignedUrlQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSignedUrlQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSignedUrlQuery({
 *   variables: {
 *      content_type: // value for 'content_type'
 *      expires_in: // value for 'expires_in'
 *      file_name: // value for 'file_name'
 *      config_slug: // value for 'config_slug'
 *   },
 * });
 */
export function useGetSignedUrlQuery(baseOptions: Apollo.QueryHookOptions<GetSignedUrlQuery, GetSignedUrlQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSignedUrlQuery, GetSignedUrlQueryVariables>(GetSignedUrlDocument, options);
      }
export function useGetSignedUrlLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSignedUrlQuery, GetSignedUrlQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSignedUrlQuery, GetSignedUrlQueryVariables>(GetSignedUrlDocument, options);
        }
export type GetSignedUrlQueryHookResult = ReturnType<typeof useGetSignedUrlQuery>;
export type GetSignedUrlLazyQueryHookResult = ReturnType<typeof useGetSignedUrlLazyQuery>;
export type GetSignedUrlQueryResult = Apollo.QueryResult<GetSignedUrlQuery, GetSignedUrlQueryVariables>;
export const GetFormDocument = gql`
    query GetForm($id: String!) {
  form(id: $id) {
    form {
      ...Form
    }
  }
}
    ${FormFragmentDoc}`;

/**
 * __useGetFormQuery__
 *
 * To run a query within a React component, call `useGetFormQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetFormQuery(baseOptions: Apollo.QueryHookOptions<GetFormQuery, GetFormQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFormQuery, GetFormQueryVariables>(GetFormDocument, options);
      }
export function useGetFormLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFormQuery, GetFormQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFormQuery, GetFormQueryVariables>(GetFormDocument, options);
        }
export type GetFormQueryHookResult = ReturnType<typeof useGetFormQuery>;
export type GetFormLazyQueryHookResult = ReturnType<typeof useGetFormLazyQuery>;
export type GetFormQueryResult = Apollo.QueryResult<GetFormQuery, GetFormQueryVariables>;
export const GetFormResponseDocument = gql`
    query GetFormResponse($pathway_id: String!, $activity_id: String!) {
  formResponse(pathway_id: $pathway_id, activity_id: $activity_id) {
    response {
      answers {
        question_id
        value
        value_type
      }
    }
  }
}
    `;

/**
 * __useGetFormResponseQuery__
 *
 * To run a query within a React component, call `useGetFormResponseQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetFormResponseQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetFormResponseQuery({
 *   variables: {
 *      pathway_id: // value for 'pathway_id'
 *      activity_id: // value for 'activity_id'
 *   },
 * });
 */
export function useGetFormResponseQuery(baseOptions: Apollo.QueryHookOptions<GetFormResponseQuery, GetFormResponseQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetFormResponseQuery, GetFormResponseQueryVariables>(GetFormResponseDocument, options);
      }
export function useGetFormResponseLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetFormResponseQuery, GetFormResponseQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetFormResponseQuery, GetFormResponseQueryVariables>(GetFormResponseDocument, options);
        }
export type GetFormResponseQueryHookResult = ReturnType<typeof useGetFormResponseQuery>;
export type GetFormResponseLazyQueryHookResult = ReturnType<typeof useGetFormResponseLazyQuery>;
export type GetFormResponseQueryResult = Apollo.QueryResult<GetFormResponseQuery, GetFormResponseQueryVariables>;
export const OnHostedSessionCompletedDocument = gql`
    subscription OnHostedSessionCompleted {
  sessionCompleted {
    ...HostedSession
  }
}
    ${HostedSessionFragmentDoc}`;

/**
 * __useOnHostedSessionCompletedSubscription__
 *
 * To run a query within a React component, call `useOnHostedSessionCompletedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnHostedSessionCompletedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnHostedSessionCompletedSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnHostedSessionCompletedSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnHostedSessionCompletedSubscription, OnHostedSessionCompletedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnHostedSessionCompletedSubscription, OnHostedSessionCompletedSubscriptionVariables>(OnHostedSessionCompletedDocument, options);
      }
export type OnHostedSessionCompletedSubscriptionHookResult = ReturnType<typeof useOnHostedSessionCompletedSubscription>;
export type OnHostedSessionCompletedSubscriptionResult = Apollo.SubscriptionResult<OnHostedSessionCompletedSubscription>;
export const OnHostedSessionExpiredDocument = gql`
    subscription OnHostedSessionExpired {
  sessionExpired {
    ...HostedSession
  }
}
    ${HostedSessionFragmentDoc}`;

/**
 * __useOnHostedSessionExpiredSubscription__
 *
 * To run a query within a React component, call `useOnHostedSessionExpiredSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnHostedSessionExpiredSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnHostedSessionExpiredSubscription({
 *   variables: {
 *   },
 * });
 */
export function useOnHostedSessionExpiredSubscription(baseOptions?: Apollo.SubscriptionHookOptions<OnHostedSessionExpiredSubscription, OnHostedSessionExpiredSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnHostedSessionExpiredSubscription, OnHostedSessionExpiredSubscriptionVariables>(OnHostedSessionExpiredDocument, options);
      }
export type OnHostedSessionExpiredSubscriptionHookResult = ReturnType<typeof useOnHostedSessionExpiredSubscription>;
export type OnHostedSessionExpiredSubscriptionResult = Apollo.SubscriptionResult<OnHostedSessionExpiredSubscription>;
export const GetHostedSessionDocument = gql`
    query GetHostedSession {
  hostedSession {
    session {
      ...HostedSession
    }
    branding {
      logo_url
      hosted_page_title
      accent_color
      hosted_page_auto_progress
      hosted_page_autosave
      custom_theme
    }
    metadata {
      pathway_definition_id
      tenant_id
    }
  }
}
    ${HostedSessionFragmentDoc}`;

/**
 * __useGetHostedSessionQuery__
 *
 * To run a query within a React component, call `useGetHostedSessionQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHostedSessionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHostedSessionQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetHostedSessionQuery(baseOptions?: Apollo.QueryHookOptions<GetHostedSessionQuery, GetHostedSessionQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHostedSessionQuery, GetHostedSessionQueryVariables>(GetHostedSessionDocument, options);
      }
export function useGetHostedSessionLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHostedSessionQuery, GetHostedSessionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHostedSessionQuery, GetHostedSessionQueryVariables>(GetHostedSessionDocument, options);
        }
export type GetHostedSessionQueryHookResult = ReturnType<typeof useGetHostedSessionQuery>;
export type GetHostedSessionLazyQueryHookResult = ReturnType<typeof useGetHostedSessionLazyQuery>;
export type GetHostedSessionQueryResult = Apollo.QueryResult<GetHostedSessionQuery, GetHostedSessionQueryVariables>;
export const GetMessageDocument = gql`
    query GetMessage($id: String!) {
  message(id: $id) {
    message {
      id
      body
      subject
      format
      attachments {
        id
        name
        type
        url
      }
    }
  }
}
    `;

/**
 * __useGetMessageQuery__
 *
 * To run a query within a React component, call `useGetMessageQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMessageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMessageQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetMessageQuery(baseOptions: Apollo.QueryHookOptions<GetMessageQuery, GetMessageQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetMessageQuery, GetMessageQueryVariables>(GetMessageDocument, options);
      }
export function useGetMessageLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetMessageQuery, GetMessageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetMessageQuery, GetMessageQueryVariables>(GetMessageDocument, options);
        }
export type GetMessageQueryHookResult = ReturnType<typeof useGetMessageQuery>;
export type GetMessageLazyQueryHookResult = ReturnType<typeof useGetMessageLazyQuery>;
export type GetMessageQueryResult = Apollo.QueryResult<GetMessageQuery, GetMessageQueryVariables>;
export const MarkMessageAsReadDocument = gql`
    mutation MarkMessageAsRead($input: MarkMessageAsReadInput!) {
  markMessageAsRead(input: $input) {
    activity {
      ...Activity
    }
  }
}
    ${ActivityFragmentDoc}`;
export type MarkMessageAsReadMutationFn = Apollo.MutationFunction<MarkMessageAsReadMutation, MarkMessageAsReadMutationVariables>;

/**
 * __useMarkMessageAsReadMutation__
 *
 * To run a mutation, you first call `useMarkMessageAsReadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMarkMessageAsReadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [markMessageAsReadMutation, { data, loading, error }] = useMarkMessageAsReadMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useMarkMessageAsReadMutation(baseOptions?: Apollo.MutationHookOptions<MarkMessageAsReadMutation, MarkMessageAsReadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<MarkMessageAsReadMutation, MarkMessageAsReadMutationVariables>(MarkMessageAsReadDocument, options);
      }
export type MarkMessageAsReadMutationHookResult = ReturnType<typeof useMarkMessageAsReadMutation>;
export type MarkMessageAsReadMutationResult = Apollo.MutationResult<MarkMessageAsReadMutation>;
export type MarkMessageAsReadMutationOptions = Apollo.BaseMutationOptions<MarkMessageAsReadMutation, MarkMessageAsReadMutationVariables>;
export const GetHostedSessionActivitiesDocument = gql`
    query GetHostedSessionActivities($only_stakeholder_activities: Boolean) {
  hostedSessionActivities(
    only_stakeholder_activities: $only_stakeholder_activities
  ) {
    success
    activities {
      ...Activity
    }
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useGetHostedSessionActivitiesQuery__
 *
 * To run a query within a React component, call `useGetHostedSessionActivitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetHostedSessionActivitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetHostedSessionActivitiesQuery({
 *   variables: {
 *      only_stakeholder_activities: // value for 'only_stakeholder_activities'
 *   },
 * });
 */
export function useGetHostedSessionActivitiesQuery(baseOptions?: Apollo.QueryHookOptions<GetHostedSessionActivitiesQuery, GetHostedSessionActivitiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetHostedSessionActivitiesQuery, GetHostedSessionActivitiesQueryVariables>(GetHostedSessionActivitiesDocument, options);
      }
export function useGetHostedSessionActivitiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetHostedSessionActivitiesQuery, GetHostedSessionActivitiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetHostedSessionActivitiesQuery, GetHostedSessionActivitiesQueryVariables>(GetHostedSessionActivitiesDocument, options);
        }
export type GetHostedSessionActivitiesQueryHookResult = ReturnType<typeof useGetHostedSessionActivitiesQuery>;
export type GetHostedSessionActivitiesLazyQueryHookResult = ReturnType<typeof useGetHostedSessionActivitiesLazyQuery>;
export type GetHostedSessionActivitiesQueryResult = Apollo.QueryResult<GetHostedSessionActivitiesQuery, GetHostedSessionActivitiesQueryVariables>;
export const OnSessionActivityCompletedDocument = gql`
    subscription OnSessionActivityCompleted($only_stakeholder_activities: Boolean!) {
  sessionActivityCompleted(
    only_stakeholder_activities: $only_stakeholder_activities
  ) {
    ...Activity
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useOnSessionActivityCompletedSubscription__
 *
 * To run a query within a React component, call `useOnSessionActivityCompletedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnSessionActivityCompletedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnSessionActivityCompletedSubscription({
 *   variables: {
 *      only_stakeholder_activities: // value for 'only_stakeholder_activities'
 *   },
 * });
 */
export function useOnSessionActivityCompletedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnSessionActivityCompletedSubscription, OnSessionActivityCompletedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnSessionActivityCompletedSubscription, OnSessionActivityCompletedSubscriptionVariables>(OnSessionActivityCompletedDocument, options);
      }
export type OnSessionActivityCompletedSubscriptionHookResult = ReturnType<typeof useOnSessionActivityCompletedSubscription>;
export type OnSessionActivityCompletedSubscriptionResult = Apollo.SubscriptionResult<OnSessionActivityCompletedSubscription>;
export const OnSessionActivityCreatedDocument = gql`
    subscription OnSessionActivityCreated($only_stakeholder_activities: Boolean!) {
  sessionActivityCreated(
    only_stakeholder_activities: $only_stakeholder_activities
  ) {
    ...Activity
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useOnSessionActivityCreatedSubscription__
 *
 * To run a query within a React component, call `useOnSessionActivityCreatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnSessionActivityCreatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnSessionActivityCreatedSubscription({
 *   variables: {
 *      only_stakeholder_activities: // value for 'only_stakeholder_activities'
 *   },
 * });
 */
export function useOnSessionActivityCreatedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnSessionActivityCreatedSubscription, OnSessionActivityCreatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnSessionActivityCreatedSubscription, OnSessionActivityCreatedSubscriptionVariables>(OnSessionActivityCreatedDocument, options);
      }
export type OnSessionActivityCreatedSubscriptionHookResult = ReturnType<typeof useOnSessionActivityCreatedSubscription>;
export type OnSessionActivityCreatedSubscriptionResult = Apollo.SubscriptionResult<OnSessionActivityCreatedSubscription>;
export const OnSessionActivityExpiredDocument = gql`
    subscription OnSessionActivityExpired($only_stakeholder_activities: Boolean!) {
  sessionActivityExpired(
    only_stakeholder_activities: $only_stakeholder_activities
  ) {
    ...Activity
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useOnSessionActivityExpiredSubscription__
 *
 * To run a query within a React component, call `useOnSessionActivityExpiredSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnSessionActivityExpiredSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnSessionActivityExpiredSubscription({
 *   variables: {
 *      only_stakeholder_activities: // value for 'only_stakeholder_activities'
 *   },
 * });
 */
export function useOnSessionActivityExpiredSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnSessionActivityExpiredSubscription, OnSessionActivityExpiredSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnSessionActivityExpiredSubscription, OnSessionActivityExpiredSubscriptionVariables>(OnSessionActivityExpiredDocument, options);
      }
export type OnSessionActivityExpiredSubscriptionHookResult = ReturnType<typeof useOnSessionActivityExpiredSubscription>;
export type OnSessionActivityExpiredSubscriptionResult = Apollo.SubscriptionResult<OnSessionActivityExpiredSubscription>;
export const OnSessionActivityUpdatedDocument = gql`
    subscription OnSessionActivityUpdated($only_stakeholder_activities: Boolean!) {
  sessionActivityUpdated(
    only_stakeholder_activities: $only_stakeholder_activities
  ) {
    ...Activity
  }
}
    ${ActivityFragmentDoc}`;

/**
 * __useOnSessionActivityUpdatedSubscription__
 *
 * To run a query within a React component, call `useOnSessionActivityUpdatedSubscription` and pass it any options that fit your needs.
 * When your component renders, `useOnSessionActivityUpdatedSubscription` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the subscription, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOnSessionActivityUpdatedSubscription({
 *   variables: {
 *      only_stakeholder_activities: // value for 'only_stakeholder_activities'
 *   },
 * });
 */
export function useOnSessionActivityUpdatedSubscription(baseOptions: Apollo.SubscriptionHookOptions<OnSessionActivityUpdatedSubscription, OnSessionActivityUpdatedSubscriptionVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useSubscription<OnSessionActivityUpdatedSubscription, OnSessionActivityUpdatedSubscriptionVariables>(OnSessionActivityUpdatedDocument, options);
      }
export type OnSessionActivityUpdatedSubscriptionHookResult = ReturnType<typeof useOnSessionActivityUpdatedSubscription>;
export type OnSessionActivityUpdatedSubscriptionResult = Apollo.SubscriptionResult<OnSessionActivityUpdatedSubscription>;
export const SubmitChecklistDocument = gql`
    mutation SubmitChecklist($input: SubmitChecklistInput!) {
  submitChecklist(input: $input) {
    activity {
      ...Activity
    }
  }
}
    ${ActivityFragmentDoc}`;
export type SubmitChecklistMutationFn = Apollo.MutationFunction<SubmitChecklistMutation, SubmitChecklistMutationVariables>;

/**
 * __useSubmitChecklistMutation__
 *
 * To run a mutation, you first call `useSubmitChecklistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitChecklistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitChecklistMutation, { data, loading, error }] = useSubmitChecklistMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitChecklistMutation(baseOptions?: Apollo.MutationHookOptions<SubmitChecklistMutation, SubmitChecklistMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitChecklistMutation, SubmitChecklistMutationVariables>(SubmitChecklistDocument, options);
      }
export type SubmitChecklistMutationHookResult = ReturnType<typeof useSubmitChecklistMutation>;
export type SubmitChecklistMutationResult = Apollo.MutationResult<SubmitChecklistMutation>;
export type SubmitChecklistMutationOptions = Apollo.BaseMutationOptions<SubmitChecklistMutation, SubmitChecklistMutationVariables>;
export const SubmitFormResponseDocument = gql`
    mutation SubmitFormResponse($input: SubmitFormResponseInput!) {
  submitFormResponse(input: $input) {
    activity {
      ...Activity
    }
  }
}
    ${ActivityFragmentDoc}`;
export type SubmitFormResponseMutationFn = Apollo.MutationFunction<SubmitFormResponseMutation, SubmitFormResponseMutationVariables>;

/**
 * __useSubmitFormResponseMutation__
 *
 * To run a mutation, you first call `useSubmitFormResponseMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubmitFormResponseMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [submitFormResponseMutation, { data, loading, error }] = useSubmitFormResponseMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSubmitFormResponseMutation(baseOptions?: Apollo.MutationHookOptions<SubmitFormResponseMutation, SubmitFormResponseMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SubmitFormResponseMutation, SubmitFormResponseMutationVariables>(SubmitFormResponseDocument, options);
      }
export type SubmitFormResponseMutationHookResult = ReturnType<typeof useSubmitFormResponseMutation>;
export type SubmitFormResponseMutationResult = Apollo.MutationResult<SubmitFormResponseMutation>;
export type SubmitFormResponseMutationOptions = Apollo.BaseMutationOptions<SubmitFormResponseMutation, SubmitFormResponseMutationVariables>;