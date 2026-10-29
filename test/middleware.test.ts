/**
 * In block mode, patients arriving at a session or a hosted pages link get the
 * unavailable page, at the URL they asked for, so reloading once the notice is
 * switched off picks the session back up.
 */
import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'
import { middleware } from '../middleware'
import { readServiceNotice } from '../src/services/serviceNotice/readServiceNotice'

vi.mock('../src/services/serviceNotice/readServiceNotice', () => ({
  readServiceNotice: vi.fn(),
}))

const readMock = vi.mocked(readServiceNotice)

const request = (path: string) =>
  new NextRequest(new URL(path, 'https://goto.awell.health'))

describe('middleware', () => {
  it('rewrites to the unavailable page in block mode, keeping the query', async () => {
    readMock.mockResolvedValue({ mode: 'block', template: 'default' })

    const response = await middleware(request('/?sessionId=abc'))

    const rewrite = new URL(response.headers.get('x-middleware-rewrite') ?? '')
    expect(rewrite.pathname).toBe('/unavailable')
    expect(rewrite.searchParams.get('sessionId')).toBe('abc')
  })

  it.each(['off', 'banner'] as const)(
    'lets the request through in %s mode',
    async (mode) => {
      readMock.mockResolvedValue({ mode, template: 'default' })

      const response = await middleware(request('/?sessionId=abc'))

      expect(response.headers.get('x-middleware-rewrite')).toBeNull()
      expect(response.headers.get('x-middleware-next')).toBe('1')
    }
  )
})
