/**
 * Whether the tab is currently in front of the patient.
 *
 * Polling continues in both modes — a hidden tab is not an abandoned session, and
 * the session can still complete (or expire) while the patient is elsewhere. Only
 * going offline stops polling, because then no request can succeed anyway.
 */
export type PollingMode = 'visible' | 'hidden'

/**
 * How often the hosted session is polled per mode.
 *
 * The hidden interval is deliberately at the browser's background-timer floor:
 * Chrome throttles timers in hidden tabs to roughly one per minute after a few
 * minutes, so asking for anything faster buys nothing and just queues work the
 * browser will defer. Subscriptions remain the fast path; this is the fallback
 * that reconciles state if a frame is missed while hidden.
 */
export const SESSION_POLL_INTERVAL_MS: Record<PollingMode, number> = {
  visible: 2000,
  hidden: 60000,
}
