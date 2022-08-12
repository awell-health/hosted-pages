import { InlineText } from '@awell_health/ui-library'
import Image from 'next/image'
import classes from './errorPage.module.css'
import { FC, ReactNode } from 'react'
import error from '../../assets/error.svg'

export const ErrorPage: FC<{
  title: string | ReactNode
  children?: ReactNode
}> = ({ title, children }): JSX.Element => {
  return (
    <div className={classes.loading_page}>
      <div className={classes.loading_page_content}>
        <Image src={error} alt="" height={200} width={200} />
        <InlineText>{title}</InlineText>
      </div>
      {children}
    </div>
  )
}
