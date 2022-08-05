import { HorizontalSpinner, Text } from '@awell_health/ui-library'
import classes from './loadingPage.module.css'
import { FC } from 'react'

export const LoadingPage: FC<{ title: string }> = ({ title }): JSX.Element => {
  return (
    <div className={classes.loading_page}>
      <HorizontalSpinner />
      <Text>{title}</Text>
    </div>
  )
}
