import { getTheme } from './customTheme'

describe('Custom theme branding', () => {
  test('When custom theme is empty string, the default theme is set', () => {
    const customTheme = ''
    const outcome = getTheme(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: true, showLogo: true },
      form: {
        showProgressBar: true,
        showAsterisksForRequiredQuestions: true,
      },
      locales: {
        form: {
          cta_submit: '',
        },
      },
    })
  })

  test('When custom theme is empty object, the default theme is set', () => {
    const customTheme = '{}'
    const outcome = getTheme(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: true, showLogo: true },
      form: {
        showProgressBar: true,
        showAsterisksForRequiredQuestions: true,
      },
      locales: {
        form: {
          cta_submit: '',
        },
      },
    })
  })

  test('When custom theme is invalid JSON string, the default theme is set', () => {
    const customTheme = 'no valid json'
    const outcome = getTheme(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: true, showLogo: true },
      form: {
        showProgressBar: true,
        showAsterisksForRequiredQuestions: true,
      },
      locales: {
        form: {
          cta_submit: '',
        },
      },
    })
  })

  test('When custom theme is undefined, the default theme is set', () => {
    const outcome = getTheme()

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: true, showLogo: true },
      form: {
        showProgressBar: true,
        showAsterisksForRequiredQuestions: true,
      },
      locales: {
        form: {
          cta_submit: '',
        },
      },
    })
  })

  test('When custom theme is null, the default theme is set', () => {
    const customTheme = null
    const outcome = getTheme(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: true, showLogo: true },
      form: {
        showProgressBar: true,
        showAsterisksForRequiredQuestions: true,
      },
      locales: {
        form: {
          cta_submit: '',
        },
      },
    })
  })

  test('When custom theme is not in the correct shape, we should ignore unexpected fields', () => {
    const customTheme = JSON.stringify({
      hello: 'world',
      test: 123,
      layout: {
        showCloseButton: false,
      },
    })
    const outcome = getTheme(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: false, showLogo: true },
      form: {
        showProgressBar: true,
        showAsterisksForRequiredQuestions: true,
      },
      locales: {
        form: {
          cta_submit: '',
        },
      },
    })
  })

  test('When custom theme is defined then it should be parsed correctly', () => {
    const customTheme = JSON.stringify({
      layout: {
        showCloseButton: false,
        showLogo: false,
      },
      form: {
        showProgressBar: true,
        showAsterisksForRequiredQuestions: false,
      },
      locales: {
        form: {
          cta_submit: 'Custom copy',
        },
      },
    })
    const outcome = getTheme(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: false, showLogo: false },
      form: {
        showProgressBar: true,
        showAsterisksForRequiredQuestions: false,
      },
      locales: {
        form: {
          cta_submit: 'Custom copy',
        },
      },
    })
  })

  test('When custom theme is partially defined then it should be parsed correctly and merged with defaut', () => {
    const customTheme = JSON.stringify({
      layout: {
        showLogo: false,
      },
    })
    const outcome = getTheme(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: true, showLogo: false },
      form: {
        showProgressBar: true,
        showAsterisksForRequiredQuestions: true,
      },
      locales: {
        form: {
          cta_submit: '',
        },
      },
    })
  })
})
