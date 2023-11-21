import { HorizontalSpinner } from '@awell_health/ui-library'
import classes from './loadingPage.module.css'
import { FC } from 'react'

interface LoadingPageProps {
  title: string
  /* This is needed to avoid css flickers until branding is loaded */
  hideLoader?: boolean
}
export const LoadingPage: FC<LoadingPageProps> = ({
  title,
  hideLoader,
}): JSX.Element => {
  return (
    <div className={classes.loading_page}>
      {!hideLoader && <HorizontalSpinner />}
      <div className={classes.loading_text}>{title}</div>
    </div>
  )
}
