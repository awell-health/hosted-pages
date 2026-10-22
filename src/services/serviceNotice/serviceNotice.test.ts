/**
 * The service notice is typed by hand into Vercel Global Config, possibly in
 * the middle of an incident. Only `mode` has to be right: a broken template or
 * message falls back to the shipped wording rather than hiding the notice, and
 * anything without a valid mode reads as off.
 */
import { describe, expect, it } from 'vitest'
import { parseServiceNotice, SERVICE_NOTICE_OFF } from './serviceNotice'

describe('parseServiceNotice', () => {
  it.each([
    ['a missing key', undefined],
    ['null', null],
    ['a string', 'block'],
    ['an unknown mode', { mode: 'Block' }],
    ['no mode', { template: 'default' }],
  ])('reads %s as off', (_case, raw) => {
    expect(parseServiceNotice(raw)).toEqual(SERVICE_NOTICE_OFF)
  })

  it('reads a bare mode with the default template', () => {
    expect(parseServiceNotice({ mode: 'block' })).toEqual({
      mode: 'block',
      template: 'default',
    })
  })

  it('falls back to the default template when the template is unknown', () => {
    expect(
      parseServiceNotice({ mode: 'banner', template: 'no-such-template' })
    ).toEqual({ mode: 'banner', template: 'default' })
  })

  it('keeps valid per-locale messages and drops broken ones', () => {
    const notice = parseServiceNotice({
      mode: 'block',
      message: {
        en: { title: 'We are down', description: 'Please come back later.' },
        de: { title: 'Wir sind offline' },
        fr: { title: '  ', description: 'Revenez plus tard.' },
      },
    })

    expect(notice.message).toEqual({
      en: { title: 'We are down', description: 'Please come back later.' },
    })
  })

  it('ignores a message that is not an object of locales', () => {
    expect(
      parseServiceNotice({ mode: 'block', message: 'We are down' }).message
    ).toBeUndefined()
  })
})
