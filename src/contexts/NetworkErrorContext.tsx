import React, {
  createContext,
  useContext,
  useState,
  FC,
  ReactNode,
} from 'react'

interface NetworkErrorContextType {
  hasNetworkError: boolean
  networkErrorCount: number
  setNetworkError: (_hasError: boolean) => void
  incrementNetworkErrorCount: () => void
  resetNetworkErrorCount: () => void
}

const NetworkErrorContext = createContext<NetworkErrorContextType | undefined>(
  undefined
)

export const useNetworkError = () => {
  const context = useContext(NetworkErrorContext)
  if (!context) {
    throw new Error('useNetworkError must be used within NetworkErrorProvider')
  }
  return context
}

interface NetworkErrorProviderProps {
  children: ReactNode
}

export const NetworkErrorProvider: FC<NetworkErrorProviderProps> = ({
  children,
}) => {
  const [hasNetworkError, setHasNetworkError] = useState(false)
  const [networkErrorCount, setNetworkErrorCount] = useState(0)

  const setNetworkError = (hasError: boolean) => {
    setHasNetworkError(hasError)
  }

  const incrementNetworkErrorCount = () => {
    setNetworkErrorCount((prev) => prev + 1)
  }

  const resetNetworkErrorCount = () => {
    setNetworkErrorCount(0)
  }

  return (
    <NetworkErrorContext.Provider
      value={{
        hasNetworkError,
        networkErrorCount,
        setNetworkError,
        incrementNetworkErrorCount,
        resetNetworkErrorCount,
      }}
    >
      {children}
    </NetworkErrorContext.Provider>
  )
}
