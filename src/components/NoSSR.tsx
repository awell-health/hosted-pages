import dynamic from 'next/dynamic'
import React from 'react'

const Wrapper: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  return <>{children}</>
}
/**
 * This component disables SSR on all its children components.
 */
export const NoSSRComponent = dynamic(Promise.resolve(Wrapper), {
  ssr: false,
})
