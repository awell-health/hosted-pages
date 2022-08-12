import React from 'react'

export interface ErrorInfo {
  componentStack: string
}

export interface ErrorBoundaryProps {
  onError?: (error: Error) => void
  children: React.ReactNode
  pathwayId?: string
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  info: ErrorInfo | null
}
