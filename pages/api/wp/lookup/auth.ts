import axios from 'axios'
import { WpEnvSettings } from '../settings'

type WPTokenCache = {
  P360_cachedToken: null | string
  P360_tokenExpiry: null | number
}

let tokenCache: WPTokenCache = {
  P360_cachedToken: null,
  P360_tokenExpiry: null,
}

export const getAccessToken = async ({
  settings,
}: {
  settings: WpEnvSettings
}) => {
  // Check if we have a valid token cached
  if (
    tokenCache.P360_cachedToken &&
    tokenCache.P360_tokenExpiry &&
    tokenCache.P360_tokenExpiry > Date.now()
  ) {
    return tokenCache.P360_cachedToken
  }

  // Request a new token
  const authUrl = settings.WP_P360_AUTH_URL
  const clientId = settings.WP_P360_CLIENT_ID
  const clientSecret = settings.WP_P360_CLIENT_SECRET

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString(
    'base64'
  )

  const response = await axios.post(
    authUrl,
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      scope: 'p360/access',
    }),
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
    }
  )

  const { access_token, expires_in } = response.data

  // Cache the token and set the expiration time
  tokenCache.P360_cachedToken = access_token

  const buffer = 60000 // Subtract 60 seconds for buffer
  tokenCache.P360_tokenExpiry = Date.now() + expires_in * 1000 - buffer

  return tokenCache.P360_cachedToken
}
