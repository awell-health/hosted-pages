import { z } from 'zod'

const EnvSchema = z.object({
  SOL_API_BASE_URL: z
    .string()
    .url(
      'SOL_API_BASE_URL env variable is missing or is not a URL (expected e.g. https://api.solmentalhealth.com)'
    ),
})

export type SolEnvSettings = z.infer<typeof EnvSchema>

type GetSolEnvSettings = () => {
  baseUrl: string
}

/**
 * SOL's Smart Scheduling API v3 is unauthenticated; the only setting is the
 * host. Production: https://api.solmentalhealth.com. Stage (for sandbox
 * testing): https://api-stage.solmentalhealth.com.
 */
export const getSolEnvSettings: GetSolEnvSettings = () => {
  const parsedEnv = EnvSchema.safeParse(process.env)

  if (!parsedEnv.success) {
    const errorMessages = parsedEnv.error.errors
      .map((e) => e.message)
      .join(', ')
    throw new Error(`Environment variable validation failed: ${errorMessages}`)
  }

  return {
    baseUrl: parsedEnv.data.SOL_API_BASE_URL.replace(/\/+$/, ''),
  }
}

export enum API_METHODS {
  GET_PROVIDER = 'GET_PROVIDER',
  GET_PROVIDERS = 'GET_PROVIDERS',
  GET_AVAILABILITY = 'GET_AVAILABILITY',
  BOOK_EVENT = 'BOOK_EVENT',
}

export const API_ROUTES: Record<API_METHODS, string> = {
  [API_METHODS.GET_PROVIDER]: '/smartscheduling/api/v3/providers',
  [API_METHODS.GET_PROVIDERS]: '/smartscheduling/api/v3/providers',
  [API_METHODS.GET_AVAILABILITY]: '/smartscheduling/api/v3/events',
  [API_METHODS.BOOK_EVENT]: '/smartscheduling/api/v3/appointments',
}
