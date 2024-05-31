import { Log } from '@google-cloud/logging'
import Container from 'typedi'

const metadata = {
  resource: { type: 'global' },
}

export function log(params: {}, severity: string, error: string | {}) {
  if (!Container.has('gcpLogger')) {
    console.log('GCP log entry:', JSON.stringify({ params, severity, error }))
  } else {
    const logger = Container.get<Log>('gcpLogger')
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
