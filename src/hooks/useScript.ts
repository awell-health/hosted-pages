import { useEffect, useRef } from 'react'

export const useScript = (url: string) => {
  const scriptRef = useRef(document.createElement('script'))

  useEffect(() => {
    const script = scriptRef.current

    script.src = url
    script.async = true

    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [url])
}
