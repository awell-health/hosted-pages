import { Log, Logging } from '@google-cloud/logging'
import path from 'path'
import fs from 'fs'
import os from 'os'

const metadata = {
  resource: { type: 'global' },
}

let loggerInstance: Log | undefined = undefined

const getLogger = (): Log | undefined => {
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_KEY) {
    console.error(
      'Environment variable GOOGLE_APPLICATION_CREDENTIALS_KEY is not set'
    )
    return undefined
  }

  if (loggerInstance === undefined) {
    console.log('Initializing logger')
    const keyFile = path.join(os.tmpdir(), 'logging-sa-key.json')
    fs.writeFileSync(
      keyFile,
      process.env.GOOGLE_APPLICATION_CREDENTIALS_KEY ?? ''
    )
    const gcpLoggingClient = new Logging({ keyFile })
    loggerInstance = gcpLoggingClient.log('hosted-sessions')
  }

  return loggerInstance
}

export function log(
  params: {},
  severity: string = 'INFO',
  error?: string | {}
) {
  const logger = getLogger()
  if (logger === undefined) {
    console.log(
      'GCP log entry:',
      JSON.stringify({ params, severity, ...(error && { error }) })
    )
  } else {
    logger
      .write(
        logger.entry(
          { ...metadata, severity: severity },
          { params, ...(error && { error }) }
        )
      )
      .catch((err) => {
        console.error(
          'GCP log error:',
          JSON.stringify({ err, params, severity, ...(error && { error }) })
        )
      })
  }
}
