import React, { ReactNode } from 'react'

export const createWrapper = (Wrapper: React.FC, props: any) => {
  return function CreatedWrapper({ children }: { children: ReactNode }) {
    return <Wrapper {...props}>{children}</Wrapper>
  }
}
