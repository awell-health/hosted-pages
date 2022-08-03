import { useState } from 'react'

export const useLocalStorage = (
  key: string,
  initialValue: string
): [string, (value: string) => void, (value: string) => void] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
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
  const setValue = (value: any) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, valueToStore)
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }

  const removeItem = () => {
    if (typeof window === 'undefined') {
      return
    }
    window.localStorage.removeItem(key)
  }

  return [storedValue, setValue, removeItem]
}
