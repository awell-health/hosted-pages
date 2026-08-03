import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'

// The Apollo client factory reads credentials from sessionStorage and refuses to
// open a websocket when subscriptions are disabled for tests. Both are required
// for `createClient` to build a usable link chain under jsdom.
beforeEach(() => {
  sessionStorage.clear()
  sessionStorage.setItem('accessToken', 'test-access-token')
  sessionStorage.setItem('TEST_DISABLE_SUBSCRIPTIONS', 'true')
})

afterEach(() => {
  cleanup()
})
