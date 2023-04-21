import { useEffect, useRef } from 'react'

export const useScript = (url: string) => {
  const script = useRef(document.createElement('script'))
  useEffect(() => {
    script.current.src = url
    script.current.async = true

    document.body.appendChild(script.current)

    return () => {
      document.body.removeChild(script.current)
    }
  }, [url])
}
