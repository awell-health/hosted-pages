export class SolApiResponseError extends Error {
  public issues: { code: string; message: string; path: (string | number)[] }[]

  constructor(
    message: string,
    issues: { code: string; message: string; path: (string | number)[] }[] = []
  ) {
    super(message)
    this.name = 'SolApiResponseError'
    this.issues = issues
  }
}
