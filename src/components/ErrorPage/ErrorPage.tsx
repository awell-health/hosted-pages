import classes from './errorPage.module.css'
import { FC, ReactNode } from 'react'

export const ErrorPage: FC<{
  title: string | ReactNode
  children?: ReactNode
}> = ({ title, children }): JSX.Element => {
  return (
    <div className={classes.error_page}>
      <div className={classes.error_page_content}>
        <div className={classes.error_icon_container}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className={classes.error_icon}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div className={classes.error_text}>{title}</div>
      </div>
      {children}
    </div>
  )
}
