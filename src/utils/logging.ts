import { Log } from '@google-cloud/logging'
import Container from 'typedi'

const metadata = {
  resource: { type: 'global' },
}

export function log(params: {}, severity: string, error: string | {}) {
  const logger = Container.get<Log>('gcpLogger')
  if (logger === undefined) {
    console.log('GCP log entry:', JSON.stringify({ params, severity, error }))
  } else {
    logger
      .write(
        logger.entry({ ...metadata, severity: severity }, { params, error })
      )
      .catch((err) => {
        console.error(
          'GCP log error:',
          JSON.stringify({ err, params, severity, error })
        )
      })
  }
}
