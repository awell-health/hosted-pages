type TokenCache = {
  accessToken: null | string
  expiresAt: null | number
}

let tokenCache: TokenCache = {
  accessToken: null,
  expiresAt: null,
}

interface getAccessTokenProps {
  authUrl: string
  clientId: string
  clientSecret: string
  resource?: string
  scope?: string
}

export const getAccessToken = async (props: getAccessTokenProps) => {
  // Check if we have a valid token cached
  if (
    tokenCache.accessToken &&
    tokenCache.expiresAt &&
    tokenCache.expiresAt > Date.now()
  ) {
    return tokenCache.accessToken
  }

  const response = await fetch(props.authUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: props.clientId,
      client_secret: props.clientSecret,
      ...(props.resource && { resource: props.resource }),
      ...(props.scope && { scope: props.scope }),
    }),
  })

  const data = await response.json()

  tokenCache.accessToken = data.access_token

  const buffer = 60000 // Subtract 60 seconds for buffer
  tokenCache.expiresAt = Date.now() + data.expires_in * 1000 - buffer

  return tokenCache.accessToken
}
