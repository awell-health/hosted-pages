/**
 * Reading the notice must never stop a patient reaching their session: with no
 * store connected, or a store that cannot be read, the notice is off.
 */
import { get } from '@vercel/global-config'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { readServiceNotice } from './readServiceNotice'
import { SERVICE_NOTICE_OFF } from './serviceNotice'

vi.mock('@vercel/global-config', () => ({ get: vi.fn() }))

const getMock = vi.mocked(get)

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_AWELL_ENVIRONMENT', 'production-us')
  vi.stubEnv('GLOBAL_CONFIG', 'https://global-config.vercel.com/ecfg_x?token=t')
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('readServiceNotice', () => {
  it("reads the notice stored under this deployment's environment", async () => {
    getMock.mockResolvedValue({ mode: 'block' })

    await expect(readServiceNotice()).resolves.toEqual({
      mode: 'block',
      template: 'default',
    })
    expect(getMock).toHaveBeenCalledWith('production-us')
  })

  it('is off without a connected store, and does not try to read one', async () => {
    vi.stubEnv('GLOBAL_CONFIG', '')

    await expect(readServiceNotice()).resolves.toEqual(SERVICE_NOTICE_OFF)
    expect(getMock).not.toHaveBeenCalled()
  })

  it('accepts the legacy EDGE_CONFIG connection string', async () => {
    vi.stubEnv('GLOBAL_CONFIG', '')
    vi.stubEnv('EDGE_CONFIG', 'https://edge-config.vercel.com/ecfg_x?token=t')
    getMock.mockResolvedValue({ mode: 'block' })

    await expect(readServiceNotice()).resolves.toMatchObject({ mode: 'block' })
  })

  it('is off when the store cannot be read', async () => {
    getMock.mockRejectedValue(new Error('network down'))

    await expect(readServiceNotice()).resolves.toEqual(SERVICE_NOTICE_OFF)
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining('service notice'),
      expect.objectContaining({ error: 'network down' })
    )
  })
})
