import { get } from '@vercel/global-config'
import {
  parseServiceNotice,
  ServiceNotice,
  SERVICE_NOTICE_OFF,
} from './serviceNotice'

/**
 * Reads this deployment's service notice. Server and middleware only.
 *
 * Never throws: a store that is missing or cannot be read means no notice, so
 * patients still reach their session. Logs go to `console` because the
 * middleware runs in the edge runtime, where Sentry is not initialised; Vercel's
 * runtime logs pick them up.
 */
export const readServiceNotice = async (): Promise<ServiceNotice> => {
  const environment = process.env.NEXT_PUBLIC_AWELL_ENVIRONMENT
  const hasStore = Boolean(process.env.GLOBAL_CONFIG || process.env.EDGE_CONFIG)
  if (!environment || !hasStore) return SERVICE_NOTICE_OFF

  try {
    return parseServiceNotice(await get(environment))
  } catch (error) {
    console.warn('Could not read the service notice, treating it as off', {
      environment,
      error: error instanceof Error ? error.message : String(error),
    })
    return SERVICE_NOTICE_OFF
  }
}
