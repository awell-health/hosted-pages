type Environment = {
  apiGatewayConsumerName: string
  jwtAuthSecret: string
  jwtAuthKey: string
  orchestrationApiUrl: string
}

export const environment: Environment = {
  apiGatewayConsumerName: process.env.HOSTED_PAGES_CONSUMER_NAME!,
  jwtAuthSecret: process.env.HOSTED_PAGES_AUTH_SECRET!,
  jwtAuthKey: process.env.HOSTED_PAGES_AUTH_KEY!,
  orchestrationApiUrl: process.env.NEXT_PUBLIC_URL_ORCHESTRATION_API!,
}
