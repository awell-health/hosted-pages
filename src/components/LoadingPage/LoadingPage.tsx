import classes from './loadingPage.module.css'
import { FC } from 'react'

interface LoadingPageProps {
  showLogoBox?: boolean
}
export const LoadingPage: FC<LoadingPageProps> = ({
  showLogoBox = false,
}): JSX.Element => {
  return (
    <div className={classes.loading_container}>
      {showLogoBox && (
        <div className={classes.logo_box}>
          <div className={classes.logo_shadow}></div>
        </div>
      )}
      <div className={classes.loading_indicators}>
        <div className={classes.loading_indicators}>
          <div className={classes.loading_indicator}></div>
          <div className={classes.loading_indicator}></div>
          <div className={classes.loading_indicator}></div>
        </div>
      </div>
    </div>
  )
}
