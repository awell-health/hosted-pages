import { Logging } from '@google-cloud/logging'

const logging = new Logging({
  projectId: 'awell-development',
})

const logger = logging.log('hosted-sessions-play-with')

const metadata = {
  resource: { type: 'global' },
}

export function info(message: {}) {
  const entry = logger.entry({ ...metadata, severity: 'INFO' }, { message })
  logger
    .write(entry)
    .then(() => {
      console.log(`Logged: ${message}`)
    })
    .catch((err) => {
      console.error('Error logging:', err)
    })
}

export function warning(message: {}) {
  const entry = logger.entry({ ...metadata, severity: 'WARNING' }, { message })
  logger
    .write(entry)
    .then(() => {
      console.log(`Logged: ${message}`)
    })
    .catch((err) => {
      console.error('Error logging:', err)
    })
}

export function error(message: {}, error: string | {}) {
  const entry = logger.entry(
    { ...metadata, severity: 'ERROR' },
    { message, error }
  )
  logger
    .write(entry)
    .then(() => {
      console.log(`Logged: ${message}`)
    })
    .catch((err) => {
      console.error('Error logging:', err)
    })
}

export function log(message: {}, severity: string, error: string | {}) {
  const entry = logger.entry(
    { ...metadata, severity: severity },
    { message, error }
  )
  logger
    .write(entry)
    .then(() => {
      console.log(`Logged: ${message}`)
    })
    .catch((err) => {
      console.error('Error logging:', err)
    })
}
