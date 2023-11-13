import classes from './cancelPage.module.css'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'
import Image from 'next/image'
import cancelIcon from './../../assets/cancel.svg'

export const CancelPage: FC = (): JSX.Element => {
  const { t } = useTranslation()
  return (
    <div className={classes.cancel_page}>
      <div className={classes.cancel_icon}>
        <Image src={cancelIcon} alt="" width={64} height={64} />
      </div>
      <div className={classes.cancel_text}>{t('session.session_canceled')}</div>
    </div>
  )
}
