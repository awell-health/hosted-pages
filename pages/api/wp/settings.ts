import { z } from 'zod'

const EnvSchema = z.object({
  WP_P360_BASE_URL: z.string().min(1),
  WP_P360_AUTH_URL: z.string().min(1),
  WP_P360_CLIENT_ID: z.string().min(1),
  WP_P360_CLIENT_SECRET: z.string().min(1),
  WP_P360_PARTNER_KEY: z.string().min(1),
})

export type WpEnvSettings = z.infer<typeof EnvSchema>

export const getWpEnvSettings = (): WpEnvSettings => {
  const parsedEnv = EnvSchema.safeParse(process.env)

  if (!parsedEnv.success) {
    const errorMessages = parsedEnv.error.errors
      .map((e) => e.message)
      .join(', ')
    throw new Error(`Environment variable validation failed: ${errorMessages}`)
  }

  return parsedEnv.data
}

export enum API_METHODS {
  GET_REQUESTING_PROVIDERS = 'GET_REQUESTING_PROVIDERS',
}

export const API_ROUTES: Record<API_METHODS, string> = {
  [API_METHODS.GET_REQUESTING_PROVIDERS]: '/requesting-providers',
}
