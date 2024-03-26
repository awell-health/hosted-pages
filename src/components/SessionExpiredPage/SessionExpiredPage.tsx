import classes from './sessionExpiredPage.module.css'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'
import Image from 'next/image'
import warningIcon from './../../assets/warning.svg'
interface SessionExpiredPageProps {
  redirect?: boolean
}

export const SessionExpiredPage: FC<SessionExpiredPageProps> = ({
  redirect = false,
}): JSX.Element => {
  const { t } = useTranslation()
  return (
    <div className={classes.expired_page}>
      <div className={classes.expired_icon}>
        <Image src={warningIcon} alt="" width={84} height={84} />
      </div>
      <div className={classes.expired_text_title}>
        {t('session.expired_title')}
      </div>
      <div className={classes.expired_text_subtitle}>
        {redirect
          ? t('session.redirecting_to_next_page')
          : t('session.expired_subtitle')}
      </div>
    </div>
  )
}
