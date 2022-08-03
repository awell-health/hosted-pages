import dynamic from 'next/dynamic'
import React from 'react'

const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}
/**
 * Disable SSR on the whole app.
 */
export const NoSSRComponent = dynamic(Promise.resolve(Wrapper), {
  ssr: false,
})
