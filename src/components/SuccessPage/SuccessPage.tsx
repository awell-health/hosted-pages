import classes from './successPage.module.css'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'
import Image from 'next/image'
import successIcon from './../../assets/success.svg'

interface SuccessPageProps {
  redirect?: boolean
  description?: string
}

export const SuccessPage: FC<SuccessPageProps> = ({
  redirect = false,
  description,
}): JSX.Element => {
  const { t } = useTranslation()

  const successDescription =
    description || t('session.all_activities_completed_subtitle')

  return (
    <div className={classes.success_page}>
      <div className={classes.success_icon}>
        <Image src={successIcon} alt="" width={64} height={64} />
      </div>
      <div className={classes.success_text_title}>
        {t('session.all_activities_completed_title')}
      </div>
      <div className={classes.success_text_subtitle}>
        {redirect ? t('session.redirecting_to_next_page') : successDescription}
      </div>
    </div>
  )
}
