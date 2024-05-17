export function info(message: {}) {
  fetch('/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, severity: 'INFO' }),
  })
}

export function warning(message: {}) {
  fetch('/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, severity: 'WARNING' }),
  })
}

export function error(message: {}, error: string | {}) {
  fetch('/api/log', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message, error, severity: 'ERROR' }),
  })
}
