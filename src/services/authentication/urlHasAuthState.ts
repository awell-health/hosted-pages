import { parse } from 'query-string'

export const urlHasAuthState = (): boolean => {
  const { search } = window.location
  if (!search) {
    return false
  }
  const { sessionId } = parse(search)
  if (sessionId === undefined) {
    return false
  }
  return true
}
