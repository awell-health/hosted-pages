import { CustomThemeApiField } from './validation.zod'

describe('Custom theme branding', () => {
  test('When custom theme is empty string, the default theme is set', () => {
    const customTheme = ''
    const outcome = CustomThemeApiField.parse(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: true, showLogo: true },
      form: {
        showAsterisksForRequiredQuestions: true,
      },
    })
  })

  test('When custom theme is invalid JSON string, the default theme is set', () => {
    const customTheme = 'no valid json'
    const outcome = CustomThemeApiField.parse(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: true, showLogo: true },
      form: {
        showAsterisksForRequiredQuestions: true,
      },
    })
  })

  test('When custom theme is undefined, the default theme is set', () => {
    const customTheme = undefined
    const outcome = CustomThemeApiField.parse(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: true, showLogo: true },
      form: {
        showAsterisksForRequiredQuestions: true,
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
    const outcome = CustomThemeApiField.parse(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: false, showLogo: true },
      form: {
        showAsterisksForRequiredQuestions: true,
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
        showAsterisksForRequiredQuestions: false,
      },
    })
    const outcome = CustomThemeApiField.parse(customTheme)

    expect(outcome).toStrictEqual({
      layout: { showCloseButton: false, showLogo: false },
      form: {
        showAsterisksForRequiredQuestions: false,
      },
    })
  })
})
