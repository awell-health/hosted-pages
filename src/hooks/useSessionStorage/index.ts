import { useState } from 'react'

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
      // Get from local storage by key
      const item = window.sessionStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? `${item}` : initialValue
    } catch (error) {
      // If error also return initialValue
      return `${initialValue}`
    }
  })
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to sessionStorage.
  const setValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(key, valueToStore)
      }
    } catch (error) {
      throw error
    }
  }

  const removeItem = () => {
    if (typeof window === 'undefined') {
      return
    }
    window.sessionStorage.removeItem(key)
  }

  return { storedValue, setValue, removeItem }
}
