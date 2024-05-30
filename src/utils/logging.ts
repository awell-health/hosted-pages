import { Logging } from '@google-cloud/logging'
import path from 'path'
import os from 'os'
import fs from 'fs'

const tempKeyFilePath = path.join(os.tmpdir(), 'temp-service-account-key.json')
fs.writeFileSync(
  tempKeyFilePath,
  process.env.GOOGLE_APPLICATION_CREDENTIALS_KEY ?? ''
)

const logging = new Logging({ keyFilename: tempKeyFilePath })
const logger = logging.log('hosted-sessions')

const metadata = {
  resource: { type: 'global' },
}

export function log(params: {}, severity: string, error: string | {}) {
  const entry = logger.entry(
    { ...metadata, severity: severity },
    { params, error }
  )

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS_KEY) {
    logger.write(entry).catch((err) => {
      console.error(`Error logging: ${JSON.stringify(entry)}`, err)
    })
  } else {
    console.log(JSON.stringify(entry))
  }
}
