import { IncomingHttpHeaders } from 'http'
import { z } from 'zod'

const HeadersSchema = z.object({
  'x-sol-api-url': z.string().nonempty('x-sol-api-url header is required'),
})

const EnvSchema = z.object({
  SOL_AUTH_URL: z.string().nonempty('SOL_AUTH_URL env variable is missing'),
  SOL_CLIENT_ID: z.string().nonempty('SOL_CLIENT_ID env variable is missing'),
  SOL_CLIENT_SECRET: z
    .string()
    .nonempty('SOL_CLIENT_SECRET env variable is missing'),
  SOL_RESOURCE: z.string().nonempty('SOL_RESOURCE env variable is missing'),
})

const SettingsSchema = HeadersSchema.merge(EnvSchema)

export type SolEnvSettings = z.infer<typeof SettingsSchema>

type GetSolEnvSettings = ({ headers }: { headers: IncomingHttpHeaders }) => {
  authUrl: string
  clientId: string
  clientSecret: string
  resource: string
  baseUrl: string
}

export const getSolEnvSettings: GetSolEnvSettings = ({ headers }) => {
  const parsedHeaders = HeadersSchema.safeParse(headers)

  if (!parsedHeaders.success) {
    const errorMessages = parsedHeaders.error.errors
      .map((e) => e.message)
      .join(', ')
    throw new Error(`Header validation failed: ${errorMessages}`)
  }

  const parsedEnv = EnvSchema.safeParse(process.env)

  if (!parsedEnv.success) {
    const errorMessages = parsedEnv.error.errors
      .map((e) => e.message)
      .join(', ')
    throw new Error(`Environment variable validation failed: ${errorMessages}`)
  }

  return {
    authUrl: parsedEnv.data.SOL_AUTH_URL,
    clientId: parsedEnv.data.SOL_CLIENT_ID,
    clientSecret: parsedEnv.data.SOL_CLIENT_SECRET,
    resource: parsedEnv.data.SOL_RESOURCE,
    baseUrl: parsedHeaders.data['x-sol-api-url'],
  }
}

export enum API_METHODS {
  GET_PROVIDERS = 'GET_PROVIDERS',
  GET_AVAILABILITY = 'GET_AVAILABILITY',
  BOOK_EVENT = 'BOOK_EVENT',
}

export const API_ROUTES: Record<API_METHODS, string> = {
  [API_METHODS.GET_PROVIDERS]: '/api/v2/provider',
  [API_METHODS.GET_AVAILABILITY]: '/api/event/list',
  [API_METHODS.BOOK_EVENT]: '/api/event/book',
}
