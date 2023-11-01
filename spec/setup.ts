import '@testing-library/jest-dom'
import { expect, afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

expect.extend(matchers)

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',

  keySeparator: '.',

  interpolation: {
    escapeValue: false, // not needed for react!!
  },

  resources: { en: {} },
})

afterEach(() => {
  // clean up the DOM after each test
  cleanup()
})
