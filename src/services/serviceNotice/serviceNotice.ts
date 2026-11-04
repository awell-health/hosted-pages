import { z } from 'zod'

/**
 * A notice the team switches on without a deploy, e.g. during an orchestration
 * outage. It lives in Vercel Global Config (formerly Edge Config), one key per
 * deployment environment (NEXT_PUBLIC_AWELL_ENVIRONMENT):
 *
 *   "production-us": { "mode": "block", "template": "default" }
 *
 * - `off`: nothing shown.
 * - `banner`: degraded; the session carries on (not rendered yet).
 * - `block`: patients get the unavailable page instead of their session.
 *
 * Wording comes from a template whose translations ship with the app. A
 * `message` written for a specific incident overrides it, per locale.
 */
export type ServiceNoticeMode = 'off' | 'banner' | 'block'

export const SERVICE_NOTICE_TEMPLATES = ['default'] as const
export type ServiceNoticeTemplate = typeof SERVICE_NOTICE_TEMPLATES[number]

export interface ServiceNoticeCopy {
  title: string
  description: string
}

export interface ServiceNotice {
  mode: ServiceNoticeMode
  template: ServiceNoticeTemplate
  /** Incident-specific wording keyed by locale, e.g. `{ en: {...}, de: {...} }` */
  message?: Record<string, ServiceNoticeCopy>
}

export const SERVICE_NOTICE_OFF: ServiceNotice = {
  mode: 'off',
  template: 'default',
}

const noticeSchema = z.object({
  mode: z.enum(['off', 'banner', 'block']),
  template: z.unknown(),
  message: z.unknown(),
})

const copySchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().min(1),
})

const isTemplate = (value: unknown): value is ServiceNoticeTemplate =>
  SERVICE_NOTICE_TEMPLATES.some((template) => template === value)

const parseMessage = (
  raw: unknown
): Record<string, ServiceNoticeCopy> | undefined => {
  if (typeof raw !== 'object' || raw === null) return undefined

  const valid = Object.entries(raw).flatMap(([locale, copy]) => {
    const parsed = copySchema.safeParse(copy)
    return parsed.success ? [[locale, parsed.data] as const] : []
  })
  return valid.length > 0 ? Object.fromEntries(valid) : undefined
}

/**
 * Only `mode` has to be valid. A broken template or message falls back to the
 * shipped wording rather than hiding the notice. Without a valid mode the
 * notice is off, so a typo can never block patients.
 */
export const parseServiceNotice = (raw: unknown): ServiceNotice => {
  const parsed = noticeSchema.safeParse(raw)
  if (!parsed.success) return SERVICE_NOTICE_OFF

  const { mode, template, message } = parsed.data
  const notice: ServiceNotice = {
    mode,
    template: isTemplate(template) ? template : 'default',
  }
  const validMessage = parseMessage(message)
  if (validMessage) notice.message = validMessage
  return notice
}
