import dynamic from 'next/dynamic'
import React from 'react'

const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}
/**
 * This component disables SSR on all its chilren components.
 */
export const NoSSRComponent = dynamic(Promise.resolve(Wrapper), {
  ssr: false,
})
