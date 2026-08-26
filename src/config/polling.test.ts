import { describe, expect, it } from 'vitest'
import { SESSION_POLL_INTERVAL_MS } from './polling'

describe('SESSION_POLL_INTERVAL_MS', () => {
  it('polls fast enough to feel live while the patient is looking', () => {
    expect(SESSION_POLL_INTERVAL_MS.visible).toBe(2000)
  })

  it('backs off in a hidden tab instead of stopping', () => {
    expect(SESSION_POLL_INTERVAL_MS.hidden).toBe(60000)
    expect(SESSION_POLL_INTERVAL_MS.hidden).toBeGreaterThan(
      SESSION_POLL_INTERVAL_MS.visible
    )
  })

  it('never yields a falsy interval — Apollo treats 0 as "stop polling"', () => {
    Object.values(SESSION_POLL_INTERVAL_MS).forEach((interval) => {
      expect(interval).toBeGreaterThan(0)
    })
  })
})
