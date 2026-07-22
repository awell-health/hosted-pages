import { defaultTo } from 'lodash'
import { useCallback, useState } from 'react'

interface useSessionStorageHook {
  setValue: (value: string) => void
  storedValue: string
  removeItem: () => void
}
export const useSessionStorage = (
  key: string,
  initialValue: string
): useSessionStorageHook => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.sessionStorage.getItem(key)
      return defaultTo(item, initialValue)
    } catch (error) {
      return initialValue
    }
  })
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to sessionStorage.
  const setValue = useCallback(
    (value: Function | string): void => {
      setStoredValue((previousValue) => {
        const valueToStore =
          value instanceof Function ? value(previousValue) : value
        try {
          if (typeof window !== 'undefined') {
            window.sessionStorage.setItem(key, valueToStore)
          }
        } catch (error) {
          console.warn('Error setting sessionStorage value: ', error)
        }
        return valueToStore
      })
    },
    [key]
  )

  const removeItem = useCallback((): void => {
    if (typeof window === 'undefined') return

    setStoredValue(initialValue)
    window.sessionStorage.removeItem(key)
  }, [initialValue, key])

  return { storedValue, setValue, removeItem }
}
