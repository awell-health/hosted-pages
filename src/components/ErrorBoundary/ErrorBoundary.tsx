import React from 'react'
import { ErrorPage } from '../ErrorPage'

interface ErrorInfo {
  componentStack: string
}

interface ErrorBoundaryProps {
  onError?: (error: Error) => void
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  info: ErrorInfo | null
}

// https://reactjs.org/docs/error-boundaries.html
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      info: null,
    }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState((state) => ({
      ...state,
      error,
      info,
    }))
    const { onError } = this.props
    if (onError) onError(error)
  }

  render(): React.ReactNode {
    const { hasError, error, info } = this.state
    const { children } = this.props
    const showStack = process.env.NODE_ENV === 'development'

    if (hasError) {
      if (showStack) {
        return (
          <article style={{ whiteSpace: 'pre-wrap' }}>
            <h1 className="type-m">Oops, something went wrong</h1>
            <p className="type-s">The error: {error && error.toString()}</p>
            <p className="type-s">
              Where it occurred: {info && info.componentStack}
            </p>
          </article>
        )
      }
      return <ErrorPage title="Oops, something went wrong" />
    }

    return <div id="error-boundry">{children}</div>
  }
}
