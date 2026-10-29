/**
 * Wording written for an incident wins over the template, but only in the
 * locale it was written for: a patient whose language has no custom message
 * gets the template in their own language rather than someone else's.
 */
import { render, screen } from '@testing-library/react'
import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { ServiceNoticePage } from './ServiceNoticePage'

vi.mock('next-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

vi.mock('@sentry/nextjs', () => ({
  logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}))

// The ui-library bundle reads CSS.supports at import time, which jsdom lacks.
vi.mock('@awell-health/ui-library', () => ({
  Button: (props: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props} />
  ),
}))

describe('ServiceNoticePage', () => {
  it("shows the template's wording when there is no custom message", () => {
    render(<ServiceNoticePage template="default" />)

    expect(screen.getByText('service_notice.default.title')).toBeTruthy()
    expect(screen.getByText('service_notice.default.description')).toBeTruthy()
  })

  it('shows the custom message when there is one for this locale', () => {
    render(
      <ServiceNoticePage
        template="default"
        message={{ title: 'We are down', description: 'Back by 14:00 CET.' }}
      />
    )

    expect(screen.getByText('We are down')).toBeTruthy()
    expect(screen.getByText('Back by 14:00 CET.')).toBeTruthy()
    expect(screen.queryByText('service_notice.default.title')).toBeNull()
  })
})
