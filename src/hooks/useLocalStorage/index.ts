import { useState } from 'react'

interface useLocalStorageHook {
  setLocalValue: (value: string) => void
  storedLocalValue: string
  removeLocalItem: () => void
}
export const useLocalStorage = (
  key: string,
  initialValue: string
): useLocalStorageHook => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedLocalValue, setStoredLocalValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key)
      // Parse stored json or if none return initialValue
      return item ? `${item}` : initialValue
    } catch (error) {
      // If error also return initialValue
      return `${initialValue}`
    }
  })
  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setLocalValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedLocalValue) : value
      // Save state
      setStoredLocalValue(valueToStore)
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, valueToStore)
      }
    } catch (error) {
      throw error
    }
  }

  const removeLocalItem = () => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.removeItem(key)
  }

  return { storedLocalValue, setLocalValue, removeLocalItem }
}
