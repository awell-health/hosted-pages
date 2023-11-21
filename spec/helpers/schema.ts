import { makeExecutableSchema } from '@graphql-tools/schema'

const typeDefs = `
  type ActionPayload implements Payload {
    calculationId: String!
    code: String!
    success: Boolean!
  }

  enum ActionType {
    API_CALL
    API_CALL_GRAPHQL
    CALCULATION
    CHECKLIST
    CLINICAL_NOTE
    FORM
    MESSAGE
    PLUGIN
    PUSH_TO_EMR
  }

  type ActivitiesPayload implements Payload {
    activities: [Activity!]!
    code: String!
    metadata: ActivityMetadata
    pagination: PaginationOutput
    sorting: SortingOutput
    success: Boolean!
  }

  type Activity {
    action: ActivityAction!
    container_name: String
    context: PathwayContext
    date: String!
    form: Form

    """
    Form display mode can either be conversational (1 question at a time) or regular (all questions at once). Only used in hosted pages for now.
    """
    form_display_mode: FormDisplayMode

    """Url for icon, only used by extensions custom actions"""
    icon_url: String
    id: ID!
    indirect_object: ActivityObject
    isUserActivity: Boolean!
    label: ActivityLabel
    object: ActivityObject!
    public: Boolean
    reference_id: String!
    resolution: ActivityResolution
    session_id: String
    stakeholders: [ActivityObject!]
    status: ActivityStatus!
    stream_id: String!
    sub_activities: [SubActivity!]!
    subject: ActivitySubject!
    track: ActivityTrack
  }

  enum ActivityAction {
    ACTIVATE
    ADDED
    ASSIGNED
    COMPLETE
    COMPUTED
    DELEGATED
    DELIVER
    DISCARDED
    FAILED
    FAILED_TO_SEND
    GENERATED
    IS_WAITING_ON
    POSTPONED
    PROCESSED
    READ
    REMIND
    REPORTED
    SCHEDULED
    SEND
    SKIPPED
    STOPPED
    SUBMITTED
  }

  type ActivityLabel {
    color: String!
    id: String
    text: String!
  }

  type ActivityMetadata {
    stakeholders: [ActivityObject!]
  }

  type ActivityObject {
    email: String
    id: String!
    name: String!
    preferred_language: String
    type: ActivityObjectType!
  }

  enum ActivityObjectType {
    ACTION
    API_CALL
    CALCULATION
    CHECKLIST
    CLINICAL_NOTE
    EMR_REPORT
    EMR_REQUEST
    EVALUATED_RULE
    FORM
    MESSAGE
    PATHWAY
    PATIENT
    PLUGIN
    PLUGIN_ACTION
    REMINDER
    STAKEHOLDER
    STEP
    TRACK
    USER
  }

  enum ActivityResolution {
    FAILURE
    SUCCESS
  }

  enum ActivityStatus {
    ACTIVE
    CANCELED
    DONE
    FAILED
  }

  type ActivitySubject {
    id: String
    name: String!
    type: ActivitySubjectType!
  }

  enum ActivitySubjectType {
    API_CALL
    AWELL
    PLUGIN
    STAKEHOLDER
    USER
  }

  type ActivityTrack {
    id: String
    title: String!
  }

  input AddTrackInput {
    pathway_id: String!
    track_id: String!
  }

  type AddTrackPayload implements Payload {
    code: String!
    success: Boolean!
  }

  type Address {
    city: String
    country: String
    state: String
    street: String
    zip: String
  }

  input AddressInput {
    city: String
    country: String
    state: String
    street: String
    zip: String
  }

  type Answer {
    question_id: String!
    value: String!
    value_type: DataPointValueType!
  }

  input AnswerInput {
    question_id: String!
    value: String!
  }

  type ApiCall {
    created_at: String!
    id: ID!
    request: ApiCallRequest!
    responses: [ApiCallResponse!]!
    status: ApiCallStatus!
    title: String!
  }

  type ApiCallHeader {
    key: String!
    value: String!
  }

  type ApiCallPayload implements Payload {
    api_call: ApiCall!
    code: String!
    success: Boolean!
  }

  type ApiCallRequest {
    body: String
    endpoint: String!
    headers: [ApiCallHeader!]!
    method: ApiCallRequestMethod!
  }

  enum ApiCallRequestMethod {
    GET
    POST
  }

  type ApiCallResponse {
    body: String!
    date: String!
    status: Float!
  }

  enum ApiCallStatus {
    Failed
    InProgress
    Pending
    PermanentlyFailed
    Skipped
    Success
  }

  type ApiCallsPayload implements Payload {
    api_calls: [ApiCall!]!
    code: String!
    success: Boolean!
  }

  type ApiPathwayContext {
    id: String!
    pathway_definition_id: String!
    patient_id: String
    start_date: String
  }

  type AuditTrail {
    date: SafeDate!
    user_email: String
    user_id: String!
  }

  type BaselineDataPoint {
    definition: DataPointDefinition!
    value: String
  }

  input BaselineInfoInput {
    data_point_definition_id: String!
    value: String!
  }

  type BaselineInfoPayload implements Payload {
    baselineDataPoints: [BaselineDataPoint!]!
    code: String!
    success: Boolean!
  }

  enum BooleanOperator {
    AND
    OR
  }

  type BrandingSettings {
    accent_color: String

    """
    Auto progress to the next question when using the conversational display mode in Awell Hosted Pages.
    """
    hosted_page_auto_progress: Boolean

    """Automatically save question answers locally in Awell Hosted Pages"""
    hosted_page_autosave: Boolean
    hosted_page_title: String
    logo_url: String
  }

  type CalculationResultsPayload implements Payload {
    code: String!
    result: [SingleCalculationResult!]!
    success: Boolean!
  }

  input CancelScheduledTracksInput {
    ids: [String!]!
  }

  type CancelScheduledTracksPayload implements Payload {
    code: String!
    success: Boolean!
    unscheduled_ids: [String!]!
  }

  type Checklist {
    items: [String!]!
    title: String!
  }

  type ChecklistPayload implements Payload {
    checklist: Checklist
    code: String!
    success: Boolean!
  }

  type ClinicalNotePayload implements Payload {
    clinical_note: GeneratedClinicalNote!
    code: String!
    success: Boolean!
  }

  input CompleteExtensionActivityInput {
    activity_id: String!
    data_points: [ExtensionDataPointInput!]!
  }

  type CompleteExtensionActivityPayload implements Payload {
    activity: Activity!
    code: String!
    success: Boolean!
  }

  type Condition {
    id: ID!
    operand: Operand
    operator: ConditionOperator
    reference: String
    reference_key: String
  }

  enum ConditionOperandType {
    BOOLEAN
    DATA_POINT
    DATA_SOURCE
    NUMBER
    NUMBERS_ARRAY
    STRING
  }

  enum ConditionOperator {
    CONTAINS
    DOES_NOT_CONTAIN
    IS_ANY_OF
    IS_EMPTY
    IS_EQUAL_TO
    IS_GREATER_THAN
    IS_GREATER_THAN_OR_EQUAL_TO
    IS_IN_RANGE
    IS_LESS_THAN
    IS_LESS_THAN_OR_EQUAL_TO
    IS_NONE_OF
    IS_NOT_EMPTY
    IS_NOT_EQUAL_TO
    IS_NOT_TRUE
    IS_TODAY
    IS_TRUE
  }

  input CreatePatientInput {
    address: AddressInput
    birth_date: String
    email: String
    first_name: String
    last_name: String

    """Must be in valid E164 telephone number format"""
    mobile_phone: String
    national_registry_number: String
    patient_code: String

    """Must be in valid E164 telephone number format"""
    phone: String

    """ISO 639-1 shortcode"""
    preferred_language: String

    """
    Sex code as defined by ISO standard IEC_5218, 0 - NOT_KNOWN, 1 - MALE, 2 - FEMALE
    """
    sex: Sex
  }

  type CreatePatientPayload implements Payload {
    code: String!
    patient: User
    success: Boolean!
  }

  type DataPointDefinition {
    category: DataPointSourceType!
    id: ID!
    key: String!

    """Additional context on data point"""
    metadata: [DataPointMetaDataItem!]
    optional: Boolean

    """Personally identifiable information"""
    pii: Boolean
    possibleValues: [DataPointPossibleValue!]
    range: Range
    source_definition_id: String!
    title: String!
    unit: String
    valueType: DataPointValueType!
  }

  input DataPointInput {
    data_point_definition_id: String!
    value: String!
  }

  type DataPointMetaDataItem {
    key: String!
    value: String!
  }

  type DataPointPossibleValue {
    label: String
    value: String!
  }

  enum DataPointSourceType {
    API_CALL
    API_CALL_STATUS
    CALCULATION
    EXTENSION_ACTION
    EXTENSION_WEBHOOK
    FORM
    PATHWAY
    PATIENT_PROFILE
    STEP
    TRACK
  }

  enum DataPointValueType {
    BOOLEAN
    DATE
    NUMBER
    NUMBERS_ARRAY
    STRING
    TELEPHONE
  }

  input DateFilter {
    gte: String
    lte: String
  }

  input DeletePathwayInput {
    pathway_id: String!
  }

  input DeletePatientInput {
    patient_id: String!
  }

  type Element {
    activity_type: ActionType
    context: PathwayContext!
    end_date: String
    id: ID!
    label: ActivityLabel
    name: String!
    parent_id: ID
    stakeholders: [ElementStakeholder!]!
    start_date: String!
    status: ElementStatus!
    type: ElementType!
  }

  type ElementStakeholder {
    id: ID!
    name: String
  }

  enum ElementStatus {
    ACTIVE
    DISCARDED
    DONE
    POSTPONED
    SCHEDULED
    STOPPED
  }

  enum ElementType {
    ACTION
    PATHWAY
    STEP
    TRACK
    TRIGGER
  }

  type ElementsPayload implements Payload {
    code: String!
    elements: [Element!]!
    success: Boolean!
  }

  type EmptyPayload implements Payload {
    code: String!
    success: Boolean!
  }

  type EmrReport {
    id: ID!
    message_html: String!
    metadata: [EmrReportMetadataField!]
  }

  type EmrReportMetadataField {
    id: ID!
    label: String!
    value: String
  }

  type EmrReportPayload implements Payload {
    code: String!
    report: EmrReport
    success: Boolean!
  }

  input EvaluateFormRulesInput {
    answers: [AnswerInput!]!
    form_id: String!
  }

  type EvaluateFormRulesPayload implements Payload {
    code: String!
    results: [QuestionRuleResult!]!
    success: Boolean!
  }

  type ExtensionActionField {
    id: ID!
    label: String!
    type: ExtensionActionFieldType!
    value: String!
  }

  enum ExtensionActionFieldType {
    BOOLEAN
    DATE
    HTML
    JSON
    NUMERIC
    STRING
    TEXT
  }

  type ExtensionActivityRecord {
    activity_id: String!
    data_points: [ExtensionDataPoint!]!
    date: String!
    fields: [ExtensionActionField!]!
    id: ID!
    pathway_id: String!
    plugin_action_key: String!
    plugin_key: String!
    settings: [PluginActionSettingsProperty!]
  }

  type ExtensionActivityRecordPayload implements Payload {
    code: String!
    record: ExtensionActivityRecord!
    success: Boolean!
  }

  type ExtensionDataPoint {
    label: String!
    value: String!
  }

  input ExtensionDataPointInput {
    key: String!
    value: String!
  }

  input FilterActivitiesParams {
    action: StringArrayFilter
    activity_status: StringArrayFilter
    activity_type: StringArrayFilter
    pathway_definition_id: StringArrayFilter
    pathway_status: StringArrayFilter
    patient_id: TextFilterEquals
    stakeholders: StringArrayFilter
  }

  input FilterPathwayDataPointDefinitionsParams {
    category: StringArrayFilter
    value_type: StringArrayFilter
  }

  input FilterPathwayDefinitionsParams {
    search: TextFilterContains
  }

  input FilterPathways {
    pathway_definition_id: IdFilter
    patient_id: StringArrayFilter
    release_id: StringArrayFilter
    start_date: DateFilter
    status: StringArrayFilter
    version: NumberArrayFilter
  }

  input FilterPatientPathways {
    status: StringArrayFilter!
  }

  input FilterPatients {
    name: TextFilter
    national_registry_number: TextFilterEquals
    patient_code: TextFilterEquals
    profile_id: StringArrayFilter
    search: TextFilterContains
  }

  type Form {
    definition_id: String!
    id: ID!
    key: String!
    metadata: String
    questions: [Question!]!
    release_id: String!
    title: String!
    trademark: String
  }

  enum FormDisplayMode {
    CONVERSATIONAL
    REGULAR
  }

  type FormPayload implements Payload {
    code: String!
    form: Form
    success: Boolean!
  }

  type FormResponse {
    answers: [Answer!]!
  }

  type FormResponsePayload implements Payload {
    code: String!
    response: FormResponse!
    success: Boolean!
  }

  type FormattedText {
    content: TranslatedText!
    format: String!
  }

  type FormsPayload implements Payload {
    code: String!
    forms: [Form!]
    success: Boolean!
  }

  type GeneratedClinicalNote {
    context: [GeneratedClinicalNoteContextField!]!
    id: ID!
    narratives: [GeneratedClinicalNoteNarrative!]!
  }

  type GeneratedClinicalNoteContextField {
    key: String!
    value: String!
  }

  type GeneratedClinicalNoteNarrative {
    body: String!
    id: ID!
    key: String!
    title: String!
  }

  type HostedSession {
    cancel_url: String
    id: ID!
    pathway_id: String!
    stakeholder: HostedSessionStakeholder!
    status: HostedSessionStatus!
    success_url: String
  }

  type HostedSessionActivitiesPayload implements Payload {
    activities: [Activity!]!
    code: String!
    success: Boolean!
  }

  type HostedSessionPayload implements Payload {
    branding: BrandingSettings
    code: String!
    session: HostedSession!
    success: Boolean!
  }

  type HostedSessionStakeholder {
    id: ID!
    name: String!
    type: HostedSessionStakeholderType!
  }

  enum HostedSessionStakeholderType {
    PATIENT
    STAKEHOLDER
  }

  enum HostedSessionStatus {
    ACTIVE
    COMPLETED
    EXPIRED
  }

  input IdFilter {
    eq: String
  }

  input MarkMessageAsReadInput {
    activity_id: String!
  }

  type MarkMessageAsReadPayload implements Payload {
    activity: Activity!
    code: String!
    success: Boolean!
  }

  type Message {
    attachments: [MessageAttachment!]
    body: String!
    format: MessageFormat!
    id: ID!
    subject: String
  }

  type MessageAttachment {
    id: ID!
    name: String!
    type: MessageAttachmentType!
    url: String!
  }

  enum MessageAttachmentType {
    FILE
    LINK
    VIDEO
  }

  enum MessageFormat {
    HTML
    SLATE
  }

  type MessagePayload implements Payload {
    code: String!
    message: Message
    success: Boolean!
  }

  type Mutation {
    addTrack(input: AddTrackInput!): AddTrackPayload!
    completeExtensionActivity(input: CompleteExtensionActivityInput!): CompleteExtensionActivityPayload!
    createPatient(input: CreatePatientInput, mycare: MyCareOptions): CreatePatientPayload!
    deletePathway(input: DeletePathwayInput!): EmptyPayload!
    deletePatient(input: DeletePatientInput!): EmptyPayload!
    evaluateFormRules(input: EvaluateFormRulesInput!): EvaluateFormRulesPayload!
    markMessageAsRead(input: MarkMessageAsReadInput!): MarkMessageAsReadPayload!

    """Retrieve patient demographics from an external system"""
    requestPatientDemographics(input: PatientDemographicsInput!): PatientDemographicsPayload!
    retryActivity(input: RetryActivityInput!): EmptyPayload!
    retryAllApiCalls(input: RetryAllApiCallsInput!): EmptyPayload!
    retryAllFailedApiCalls(input: RetryAllFailedApiCallsInput!): EmptyPayload!
    retryAllFailedWebhookCalls(input: RetryAllFailedWebhookCallsInput!): EmptyPayload!
    retryAllFailedWebhookCallsForPathwayDefinition(input: RetryAllFailedWebhookCallsForPathwayDefinitionInput!): EmptyPayload!
    retryAllWebhookCalls(input: RetryAllWebhookCallsInput!): EmptyPayload!
    retryApiCall(input: RetryApiCallInput!): RetryApiCallPayload!
    retryPushToEmr(input: RetryPushToEmrInput!): EmptyPayload!
    retryWebhookCall(input: RetryWebhookCallInput!): RetryWebhookCallPayload!
    saveBaselineInfo(input: SaveBaselineInfoInput!): EmptyPayload!
    scheduleTrack(input: ScheduleTrackInput!): ScheduleTrackPayload!
    startHostedActivitySession(input: StartHostedActivitySessionInput!): StartHostedActivitySessionPayload!
    startHostedActivitySessionViaHostedPagesLink(input: StartHostedActivitySessionViaHostedPagesLinkInput!): StartHostedActivitySessionPayload!
    startHostedPathwaySession(input: StartHostedPathwaySessionInput!): StartHostedPathwaySessionPayload!
    startPathway(input: StartPathwayInput!): StartPathwayPayload!
    stopPathway(input: StopPathwayInput!): EmptyPayload!
    stopTrack(input: StopTrackInput!): StopTrackPayload!
    submitChecklist(input: SubmitChecklistInput!): SubmitChecklistPayload!
    submitFormResponse(input: SubmitFormResponseInput!): SubmitFormResponsePayload!
    unscheduleTracks(input: CancelScheduledTracksInput!): CancelScheduledTracksPayload!
    updateBaselineInfo(input: UpdateBaselineInfoInput!): EmptyPayload!
    updatePatient(input: UpdatePatientInput!): UpdatePatientPayload!

    """
    Update which patient was created after import request for logging purposes
    """
    updatePatientDemographicsQuery(input: UpdatePatientDemographicsQueryInput!): UpdatePatientDemographicsQueryPayload!
    updatePatientLanguage(input: UpdatePatientLanguageInput!): UpdatePatientLanguagePayload!
  }

  input MyCareOptions {
    password: String
  }

  input NumberArrayFilter {
    in: [Float!]
  }

  type Operand {
    type: ConditionOperandType!
    value: String!
  }

  type Option {
    id: ID!
    label: String!
    value: Float!
  }

  type OrchestrationFact {
    content: [String!]!
    date: String!
    level: String!
    pathway_id: String!
  }

  type OrchestrationFactsPayload implements Payload {
    code: String!
    facts: [OrchestrationFact!]!
    pagination: PaginationOutput
    sorting: SortingOutput
    success: Boolean!
  }

  type PaginationOutput {
    count: Float
    offset: Float
    total_count: Float
  }

  input PaginationParams {
    count: Float!
    offset: Float!
  }

  type Pathway {
    activities: [Activity!]!
    complete_date: SafeDate
    dashboards: PathwayDashboard
    id: ID!
    pathway_definition_id: String!
    patient: User!
    patient_id: String!
    release_id: String!
    start_date: SafeDate
    status: PathwayStatus!
    status_explanation: String
    stop_date: SafeDate
    swimlanes: Swimlanes!
    title: String!
    tracks: [Track!]!
    version: Float
  }

  type PathwayContext {
    action_id: String
    instance_id: String!
    pathway_id: String!
    step_id: String
    track_id: String
  }

  type PathwayDashboard {
    cumulio_auth_id: String!
    cumulio_auth_token: String!
    dashboard_ids: [String!]!
  }

  type PathwayDataPointDefinitionsPayload implements Payload {
    code: String!
    data_point_definitions: [DataPointDefinition!]!
    success: Boolean!
  }

  type PathwayDefinitionDetails {
    active_careflows: Float
    completed_careflows: Float
    stopped_careflows: Float
    total_careflows: Float
    total_patients: Float
  }

  input PathwayFactsFilters {
    date: DateFilter
    keyword: String
    pathway_id: String!
  }

  type PathwayPayload implements Payload {
    code: String!
    pathway: Pathway
    success: Boolean!
  }

  enum PathwayStatus {
    active
    completed
    missing_baseline_info
    starting
    stopped
  }

  type PathwaySummary {
    complete_date: SafeDate
    id: ID!
    pathway_definition_id: String
    patient_id: String
    start_date: SafeDate
    status: PathwayStatus!
    status_explanation: String
    stop_date: SafeDate
    title: String!
    version: Float
  }

  type PathwaysPayload implements Payload {
    code: String!
    pagination: PaginationOutput
    pathways: [PathwaySummary!]!
    sorting: SortingOutput
    success: Boolean!
  }

  input PatientDemographicsInput {
    patient_identifier: String!
  }

  type PatientDemographicsPayload implements Payload {
    code: String!
    entry: [UserProfile!]
    query_id: String!
    status: String!
    success: Boolean!
    total: Float
  }

  type PatientDemographicsQueryConfigurationPayload {
    input_box_text: String
    is_enabled: Boolean!
  }

  type PatientPathway {
    active_activities: Float
    baseline_info: [BaselineDataPoint!]
    complete_date: String
    failed_activities: Float
    id: ID!
    latest_activity_date: String
    latest_activity_title: String
    latest_activity_type: String
    pathway_definition_id: String!
    release_id: String!
    status: PathwayStatus!
    status_explanation: String
    stop_date: String
    title: String!
    total_activities: Float
    version: Float
  }

  type PatientPathwaysPayload implements Payload {
    code: String!
    patientPathways: [PatientPathway!]!
    success: Boolean!
  }

  type PatientPayload implements Payload {
    code: String!
    patient: User
    success: Boolean!
  }

  input PatientProfileInput {
    address: AddressInput
    birth_date: String
    email: String
    first_name: String
    last_name: String

    """Must be in valid E164 telephone number format"""
    mobile_phone: String
    national_registry_number: String
    patient_code: String

    """Must be in valid E164 telephone number format"""
    phone: String

    """ISO 639-1 shortcode"""
    preferred_language: String

    """
    Sex code as defined by ISO standard IEC_5218, 0 - NOT_KNOWN, 1 - MALE, 2 - FEMALE
    """
    sex: Sex
  }

  type PatientsPayload implements Payload {
    code: String!
    pagination: PaginationOutput!
    patients: [User!]!
    sorting: SortingOutput!
    success: Boolean!
  }

  interface Payload {
    code: String!
    success: Boolean!
  }

  type PluginActionSettingsProperty {
    key: String!
    label: String!
    value: String!
  }

  type PublishedPathwayDefinition {
    active_activities: Float

    """Details about the latest pathway definition"""
    all: PathwayDefinitionDetails
    cancelled_activities: Float
    created: AuditTrail

    """Starting/baseline data point definitions for the pathway"""
    dataPointDefinitions: [DataPointDefinition!]! @deprecated(reason: "Use data_point_definitions instead")

    """Starting/baseline data point definitions for the pathway"""
    data_point_definitions: [DataPointDefinition!]
    failed_activities: Float
    id: ID!
    last_updated: AuditTrail

    """Details about all pathway definitions"""
    latest: PathwayDefinitionDetails
    patients_with_pending_activities: Float
    release_date: String
    release_id: String
    stakeholders_with_pending_activities_list: [String!]
    title: String!
    total_activities: Float
    total_patients: Float
    total_stakeholders: Float

    """Tracks for the pathway"""
    track_definitions: [Track!]
    version: Float
  }

  type PublishedPathwayDefinitionsPayload implements Payload {
    code: String!
    pagination: PaginationOutput
    publishedPathwayDefinitions: [PublishedPathwayDefinition!]!
    sorting: SortingOutput
    success: Boolean!
  }

  type Query {
    activities(filters: FilterActivitiesParams, pagination: PaginationParams, sorting: SortingParams): ActivitiesPayload!
    adHocTracksByPathway(pathway_id: String!): TracksPayload!
    adHocTracksByRelease(release_id: String!): TracksPayload!
    apiCall(id: String!): ApiCallPayload!
    apiCalls(pathway_id: String!): ApiCallsPayload!
    baselineInfo(pathway_id: String!): BaselineInfoPayload!
    calculationAction(id: String!): ActionPayload!
    calculationResults(activity_id: String!, pathway_id: String!): CalculationResultsPayload!
    checklist(id: String!): ChecklistPayload!
    clinicalNote(id: String!): ClinicalNotePayload!
    emrReport(id: String!): EmrReportPayload!
    extensionActivityRecord(id: String!): ExtensionActivityRecordPayload!
    filterStakeholders(pathway_definition_ids: [String!], release_ids: [String!], stakeholder_definition_ids: [String!]): StakeholdersPayload!
    form(id: String!): FormPayload!
    formResponse(activity_id: String!, pathway_id: String!): FormResponsePayload!
    forms(pathway_definition_id: String!, release_id: String): FormsPayload!
    getStatusForPublishedPathwayDefinitions: PublishedPathwayDefinitionsPayload!
    hostedSession: HostedSessionPayload!
    hostedSessionActivities(only_stakeholder_activities: Boolean): HostedSessionActivitiesPayload!
    message(id: String!): MessagePayload!
    myActivities(pathway_id: String!): ActivitiesPayload!
    myPathways: PathwaysPayload!
    myPendingActivities: ActivitiesPayload!
    pathway(id: String!): PathwayPayload!
    pathwayActivities(pathway_id: String!): ActivitiesPayload!
    pathwayDataPointDefinitions(filters: FilterPathwayDataPointDefinitionsParams, pathway_definition_id: String, release_id: String!): PathwayDataPointDefinitionsPayload!
    pathwayElements(pathway_id: String!): ElementsPayload!
    pathwayFacts(filters: PathwayFactsFilters!, pagination: PaginationParams, sorting: SortingParams): OrchestrationFactsPayload!
    pathwayStepActivities(pathway_id: String!, step_id: String!): ActivitiesPayload!
    pathways(filters: FilterPathways, pagination: PaginationParams, sorting: SortingParams): PathwaysPayload!
    patient(id: String!): PatientPayload!
    patientDemographicsQueryConfiguration: PatientDemographicsQueryConfigurationPayload!
    patientPathways(filters: FilterPatientPathways, patient_id: String!): PatientPathwaysPayload!
    patients(filters: FilterPatients, pagination: PaginationParams, sorting: SortingParams): PatientsPayload!
    publishedPathwayDefinitions: PublishedPathwayDefinitionsPayload!
    publishedPathwayDefinitionsDashboard(filters: FilterPathwayDefinitionsParams, pagination: PaginationParams, sorting: SortingParams): PublishedPathwayDefinitionsPayload!
    scheduledSteps(pathway_id: String!): ScheduledStepsPayload!
    scheduledTracksForPathway(pathway_id: String!): ScheduledTracksPayload!
    searchPatientsByNationalRegistryNumber(national_registry_number: String!): SearchPatientsPayload!
    searchPatientsByPatientCode(patient_code: String!): SearchPatientsPayload!
    stakeholdersByDefinitionIds(stakeholder_definition_ids: [String!]!): StakeholdersPayload!
    stakeholdersByPathwayDefinitionIds(pathway_definition_ids: [String!]!): StakeholdersPayload!
    stakeholdersByReleaseIds(release_ids: [String!]!): StakeholdersPayload!
    webhookCall(webhook_call_id: String!): WebhookCallPayload!
    webhookCalls(pathway_id: String!): WebhookCallsPayload!
    webhookCallsForPathwayDefinition(pathway_definition_id: String!): WebhookCallsPayload!
    webhookCallsForTenant: WebhookCallsPayload!
    whoami: UserPayload!
  }

  type Question {
    dataPointValueType: DataPointValueType
    definition_id: String!
    id: ID!
    key: String!
    metadata: String
    options: [Option!]
    questionConfig: QuestionConfig
    questionType: QuestionType
    rule: Rule
    title: String!
    userQuestionType: UserQuestionType
  }

  type QuestionConfig {
    mandatory: Boolean!
    recode_enabled: Boolean
    slider: SliderConfig
    use_select: Boolean
  }

  input QuestionResponseInput {
    question_id: String!
    value: String!
  }

  type QuestionRuleResult {
    question_id: String!
    rule_id: String!
    satisfied: Boolean!
  }

  enum QuestionType {
    INPUT
    MULTIPLE_CHOICE
    NO_INPUT
  }

  type Range {
    max: Float
    min: Float
  }

  input RetryActivityInput {
    activity_id: String!
  }

  input RetryAllApiCallsInput {
    pathway_id: String!
  }

  input RetryAllFailedApiCallsInput {
    pathway_id: String!
  }

  input RetryAllFailedWebhookCallsForPathwayDefinitionInput {
    pathway_definition_id: String!
  }

  input RetryAllFailedWebhookCallsInput {
    pathway_id: String!
  }

  input RetryAllWebhookCallsInput {
    pathway_id: String!
  }

  input RetryApiCallInput {
    api_call_id: String!
  }

  type RetryApiCallPayload implements Payload {
    api_call: ApiCall!
    code: String!
    success: Boolean!
  }

  input RetryPushToEmrInput {
    activity_id: String!
  }

  input RetryWebhookCallInput {
    webhook_call_id: String!
  }

  type RetryWebhookCallPayload implements Payload {
    code: String!
    success: Boolean!
    webhook_call: WebhookCall!
  }

  type Rule {
    boolean_operator: BooleanOperator!
    conditions: [Condition!]!
    definition_id: String
    id: ID!
  }

  """Safe date scalar that can serialize string or date"""
  scalar SafeDate

  input SaveBaselineInfoInput {
    baseline_info: [BaselineInfoInput!]!
    pathway_id: String!
  }

  input ScheduleTrackInput {
    cancel_any_scheduled: Boolean
    pathway_id: String!
    scheduled_date: String!
    track_id: String!
  }

  type ScheduleTrackPayload implements Payload {
    code: String!
    id: String!
    success: Boolean!
  }

  type ScheduledStepsPayload implements Payload {
    code: String!
    steps: [Element!]!
    success: Boolean!
  }

  type ScheduledTrack {
    created_by_user_id: String!
    created_date: String!
    id: ID!
    modified_date: String
    pathway_id: String!
    release_id: String!
    scheduled_date: String!
    status: String!
    tenant_id: String!
    title: String!
    track_definition_id: String!
  }

  type ScheduledTracksPayload implements Payload {
    code: String!
    scheduled_tracks: [ScheduledTrack!]!
    success: Boolean!
  }

  type SearchPatientsPayload implements Payload {
    code: String!
    patients: [User!]!
    success: Boolean!
  }

  enum Sex {
    FEMALE
    MALE
    NOT_KNOWN
  }

  type SingleCalculationResult {
    status: String
    subresult_id: String!
    unit: String
    value: String!
    value_type: DataPointValueType
  }

  type SliderConfig {
    display_marks: Boolean!
    is_value_tooltip_on: Boolean!
    max: Float!
    max_label: String!
    min: Float!
    min_label: String!
    show_min_max_values: Boolean!
    step_value: Float!
  }

  type SortingOutput {
    direction: String!
    field: String!
  }

  input SortingParams {
    direction: String!
    field: String!
  }

  type Stakeholder {
    clinical_app_role: StakeholderClinicalAppRole!
    definition_id: String!
    id: ID!
    label: StakeholderLabel!
    release_id: String!
    version: Float!
  }

  enum StakeholderClinicalAppRole {
    CAREGIVER
    PATIENT
    PHYSICIAN
  }

  type StakeholderLabel {
    en: String
  }

  type StakeholdersPayload implements Payload {
    code: String!
    stakeholders: [Stakeholder!]!
    success: Boolean!
  }

  input StartHostedActivitySessionInput {
    cancel_url: String

    """ISO 639-1 shortcode"""
    language: String
    pathway_id: String!
    stakeholder_id: String!
    success_url: String
  }

  type StartHostedActivitySessionPayload implements Payload {
    code: String!
    language: String
    session_id: String!
    session_url: String!
    success: Boolean!
  }

  input StartHostedActivitySessionViaHostedPagesLinkInput {
    hosted_pages_link_id: String!
  }

  input StartHostedPathwaySessionInput {
    cancel_url: String
    data_points: [DataPointInput!]

    """ISO 639-1 shortcode"""
    language: String
    pathway_definition_id: String!
    patient_id: String
    success_url: String
  }

  type StartHostedPathwaySessionPayload implements Payload {
    code: String!
    pathway_id: String!
    session_id: String!
    session_url: String!
    stakeholder: HostedSessionStakeholder!
    success: Boolean!
  }

  input StartPathwayInput {
    data_points: [DataPointInput!]
    pathway_definition_id: String!
    patient_id: String!
  }

  type StartPathwayPayload implements Payload {
    code: String!
    pathway_id: String!
    stakeholders: [Stakeholder!]!
    success: Boolean!
  }

  input StopPathwayInput {
    pathway_id: String!
    reason: String
  }

  input StopTrackInput {
    pathway_id: String!
    track_id: String!
  }

  type StopTrackPayload implements Payload {
    code: String!
    success: Boolean!
    track: Element!
  }

  input StringArrayFilter {
    in: [String!]
  }

  type SubActivity {
    action: ActivityAction!
    date: String!
    error: String
    error_category: String
    id: String!
    object: ActivityObject
    subject: ActivitySubject!
    text: TranslatedText
  }

  input SubmitChecklistInput {
    activity_id: String!
  }

  type SubmitChecklistPayload implements Payload {
    activity: Activity!
    code: String!
    success: Boolean!
  }

  input SubmitFormResponseInput {
    activity_id: String!
    response: [QuestionResponseInput!]!
  }

  type SubmitFormResponsePayload implements Payload {
    activity: Activity!
    code: String!
    success: Boolean!
  }

  type Subscription {
    activityCompleted(only_patient_activities: Boolean, pathway_id: String): Activity!
    activityCreated(only_patient_activities: Boolean, pathway_id: String): Activity!
    activityUpdated(only_patient_activities: Boolean, pathway_id: String): Activity!
    apiCallCreated(pathway_id: String!): ApiCall!
    apiCallUpdated(pathway_id: String!): ApiCall!
    elementCompleted(element_type: ElementType, pathway_id: String!): Element!
    elementCreated(element_type: ElementType, pathway_id: String!): Element!
    elementUpdated(element_type: ElementType, pathway_id: String!): Element!
    pathwayUpdated(id: ID!): Pathway!
    sessionActivityCompleted(only_stakeholder_activities: Boolean): Activity!
    sessionActivityCreated(only_stakeholder_activities: Boolean): Activity!
    sessionActivityUpdated(only_stakeholder_activities: Boolean): Activity!
    sessionCompleted: HostedSession!
    sessionExpired: HostedSession!
    webhookCallCreated(pathway_id: String!): WebhookCall!
    webhookCallUpdated(pathway_id: String!): WebhookCall!
  }

  type Swimlane {
    id: ID!
    title: String!
  }

  type SwimlaneItem {
    category: SwimlaneItemCategory!
    column_index: Float!
    date: SafeDate
    documentation: FormattedText
    id: ID!
    info: String
    lane_id: ID!
    row_index: Float!
    title: String!
    track_id: ID
    type: SwimlaneItemType!
  }

  enum SwimlaneItemCategory {
    ACTION
    PATHWAY_END
    PATHWAY_START
    STEP
    TRACK
    TRACK_END
    TRACK_START
  }

  enum SwimlaneItemType {
    active
    completed
    pending
    possible
  }

  type SwimlaneLink {
    destination_id: ID!
    id: ID!
    origin_id: ID!
  }

  type Swimlanes {
    items: [SwimlaneItem!]!
    lanes: [Swimlane!]!
    links: [SwimlaneLink!]!
  }

  type Tenant {
    accent_color: String!
    hosted_page_title: String!
    is_default: Boolean!
    logo_path: String!
    name: String!
  }

  input TextFilter {
    contains: String
    eq: String
  }

  input TextFilterContains {
    contains: String
  }

  input TextFilterEquals {
    eq: String
  }

  type Track {
    """
    Whether the track can be triggered manually (i.e. via addTrack or scheduleTrack mutations)
    """
    can_trigger_manually: Boolean

    """The definition ID of the Track, can be used for adding or scheduling"""
    id: ID!
    release_id: String
    title: String!
  }

  type TracksPayload implements Payload {
    code: String!
    success: Boolean!
    tracks: [Track!]!
  }

  type TranslatedText {
    en: String
  }

  input UpdateBaselineInfoInput {
    baseline_info: [BaselineInfoInput!]!
    pathway_id: String!
  }

  input UpdatePatientDemographicsQueryInput {
    """
    Index from the array returned from the PDQ response, which was used to create the patient
    """
    created_patient_entry_index: Float!

    """Patient ID of the created patient in Awell"""
    created_patient_id: String!
    query_id: String!
  }

  type UpdatePatientDemographicsQueryPayload implements Payload {
    code: String!
    created_patient_entry_index: Float!
    created_patient_id: String!
    success: Boolean!
  }

  input UpdatePatientInput {
    patient_id: String!
    profile: PatientProfileInput!
  }

  input UpdatePatientLanguageInput {
    """ISO 639-1 shortcode"""
    preferred_language: String!
  }

  type UpdatePatientLanguagePayload implements Payload {
    code: String!
    success: Boolean!
    user: User
  }

  type UpdatePatientPayload implements Payload {
    code: String!
    patient: User
    success: Boolean!
  }

  type User {
    id: ID!
    profile: UserProfile
    tenant: Tenant!
    tenant_id: String!
  }

  type UserPayload implements Payload {
    code: String!
    success: Boolean!
    user: User!
  }

  type UserProfile {
    address: Address
    birth_date: String
    email: String
    first_name: String
    last_name: String
    mobile_phone: String
    name: String
    national_registry_number: String
    patient_code: String
    phone: String
    preferred_language: String

    """
    Sex code as defined by ISO standard IEC_5218, 0 - NOT_KNOWN, 1 - MALE, 2 - FEMALE
    """
    sex: Sex
  }

  enum UserQuestionType {
    DATE
    DESCRIPTION
    LONG_TEXT
    MULTIPLE_CHOICE
    MULTIPLE_CHOICE_GRID
    MULTIPLE_SELECT
    NUMBER
    SHORT_TEXT
    SIGNATURE
    SLIDER
    TELEPHONE
    YES_NO
  }

  type WebhookCall {
    created_at: String!
    event_type: String!
    id: ID!
    pathway: ApiPathwayContext
    request: WebhookCallRequest!
    responses: [WebhookCallResponse!]!
    status: String!
    webhook_id: String!
    webhook_name: String!
  }

  type WebhookCallHeader {
    key: String!
    value: String!
  }

  type WebhookCallPayload implements Payload {
    code: String!
    success: Boolean!
    webhook_call: WebhookCall!
  }

  type WebhookCallRequest {
    body: String!
    endpoint: String!
    headers: [WebhookCallHeader!]!
    method: String!
  }

  type WebhookCallResponse {
    body: String!
    date: String!
    status: Float!
  }

  type WebhookCallsPayload implements Payload {
    code: String!
    success: Boolean!
    webhook_calls: [WebhookCall!]!
  }
`

export const schema = makeExecutableSchema({ typeDefs })
