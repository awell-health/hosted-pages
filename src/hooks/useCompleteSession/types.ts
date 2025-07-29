export { useCompleteSessionMutation } from '../../types/generated/types-orchestration'

export interface CompleteSessionInput {
  session_id: string
}

export interface CompleteSessionResponse {
  completeSession: {
    success: boolean
    session: {
      id: string
      status: string
      pathway_id: string
      stakeholder: {
        id: string
        type: string
        name: string
      }
    }
  }
}
