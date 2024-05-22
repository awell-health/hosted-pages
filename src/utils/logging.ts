import { Logging } from '@google-cloud/logging'

// TODO replace with the correct environment variable
const logging = new Logging({
  projectId: 'awell-development',
})

const logger = logging.log('hosted-sessions')

const metadata = {
  resource: { type: 'global' },
}

export function log(params: {}, severity: string, error: string | {}) {
  const entry = logger.entry(
    { ...metadata, severity: severity },
    { params, error }
  )
  logger
    .write(entry)
    .then(() => {
      console.log(`Logged: ${JSON.stringify(entry)}`)
    })
    .catch((err) => {
      console.error('Error logging:', err)
    })
}
