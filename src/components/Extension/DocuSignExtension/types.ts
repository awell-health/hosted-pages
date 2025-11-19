export {
  type DataPoints,
  useCompleteExtensionActivity,
} from '../../../hooks/useCompleteExtensionActivity'

export enum ActionKey {
  EMBEDDED_SIGNING = 'embeddedSigning',
}

export type EmbeddedSigningFields = {
  signUrl: string
  envelopeId: string
  clientUserId: string
}

export enum WindowEventType {
  DOCU_SIGN_SET_EVENT = 'docu_sign_set_event',
}

export enum DocuSignEvent {
  // Recipient used incorrect access code.
  ACCESS_CODE_FAILED = 'access_code_failed',

  // Recipient canceled the signing operation, possibly by using the Finish Later option.
  CANCEL = 'cancel',

  // Recipient declined to sign.
  DECLINE = 'decline',

  // A system error occurred during the signing process.
  EXCEPTION = 'exception',

  // Recipient has a fax pending.
  FAX_PENDING = 'fax_pending',

  // Recipient failed an ID check.
  ID_CHECK_FAILED = 'id_check_failed',

  // The session timed out. An account can control this timeout by using the Signer Session Timeout option.
  SESSION_TIMEOUT = 'session_timeout',

  // The recipient completed the signing ceremony.
  SIGNING_COMPLETE = 'signing_complete',

  // The Time To Live token for the envelope has expired. After being successfully invoked, these tokens expire after five minutes.
  TTL_EXPIRED = 'ttl_expired',

  // The recipient completed viewing an envelope that is in a read-only/terminal state, such as completed, declined, or voided.
  VIEWING_COMPLETE = 'viewing_complete',
}

export type DocuSignMessage = {
  type: WindowEventType
  event: DocuSignEvent
}
