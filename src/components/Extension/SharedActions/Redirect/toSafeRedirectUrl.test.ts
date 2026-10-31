import { describe, expect, it } from 'vitest'
import { toSafeRedirectUrl } from './toSafeRedirectUrl'

const ORIGIN = 'https://hosted.awell.test'

describe('toSafeRedirectUrl', () => {
  it('keeps absolute https and http destinations, other hosts included', () => {
    expect(toSafeRedirectUrl('https://example.com/done?x=1#y', ORIGIN)).toBe(
      'https://example.com/done?x=1#y'
    )
    expect(toSafeRedirectUrl('http://example.com/', ORIGIN)).toBe(
      'http://example.com/'
    )
  })

  it('resolves a relative path against the hosted-pages origin', () => {
    expect(toSafeRedirectUrl('/thank-you', ORIGIN)).toBe(
      'https://hosted.awell.test/thank-you'
    )
  })

  it('trims surrounding whitespace before deciding', () => {
    expect(toSafeRedirectUrl('  https://example.com  ', ORIGIN)).toBe(
      'https://example.com/'
    )
  })

  it('refuses javascript: in any casing or with leading whitespace', () => {
    expect(toSafeRedirectUrl('javascript:alert(1)', ORIGIN)).toBeNull()
    expect(toSafeRedirectUrl('JavaScript:alert(1)', ORIGIN)).toBeNull()
    expect(toSafeRedirectUrl('  javascript:alert(1)', ORIGIN)).toBeNull()
    expect(toSafeRedirectUrl('java\tscript:alert(1)', ORIGIN)).toBeNull()
  })

  it('refuses every non-http(s) scheme', () => {
    for (const value of [
      'data:text/html,<script>alert(1)</script>',
      'vbscript:msgbox(1)',
      'blob:https://hosted.awell.test/uuid',
      'file:///etc/passwd',
      'ftp://example.com/x',
      'mailto:someone@example.com',
    ]) {
      expect(toSafeRedirectUrl(value, ORIGIN), value).toBeNull()
    }
  })

  it('refuses empty, non-string and unparseable values', () => {
    expect(toSafeRedirectUrl('', ORIGIN)).toBeNull()
    expect(toSafeRedirectUrl('   ', ORIGIN)).toBeNull()
    expect(toSafeRedirectUrl(undefined, ORIGIN)).toBeNull()
    expect(toSafeRedirectUrl(null, ORIGIN)).toBeNull()
    expect(toSafeRedirectUrl(42, ORIGIN)).toBeNull()
    expect(toSafeRedirectUrl('https://exa mple.com', ORIGIN)).toBeNull()
  })

  it('defaults the base to the current origin under jsdom', () => {
    expect(toSafeRedirectUrl('/next')).toBe(`${window.location.origin}/next`)
  })
})
