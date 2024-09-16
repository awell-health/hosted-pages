import { ZodError } from '@awell-health/sol-scheduling'

export class SolApiResponseError extends Error {
  public issues: ZodError['issues']

  constructor(message: string, issues: ZodError['issues'] = []) {
    super(message)
    this.name = 'SolApiResponseError'
    this.issues = issues
  }
}
