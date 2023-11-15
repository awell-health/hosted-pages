import { WithTranslation } from 'next-i18next'
import React from 'react'

export interface ErrorInfo {
  componentStack: string
}

export interface ErrorBoundaryProps extends WithTranslation {
  onError?: (error: Error) => void
  children: React.ReactNode
  style?: React.CSSProperties
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  info: ErrorInfo | null
}
