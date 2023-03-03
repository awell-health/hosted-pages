import { Language } from '../src/types/generated/types-orchestration'

export type StartHostedActivitySessionPayload = {
  sessionId: string
  language: Language
}
