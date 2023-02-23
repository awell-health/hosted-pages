import { HorizontalSpinner, Text } from '@awell_health/ui-library'
import classes from './successPage.module.css'
import { useTranslation } from 'next-i18next'
import { FC } from 'react'
import Image from 'next/image'
import successIcon from './../../assets/success.svg'

export const SuccessPage: FC = (): JSX.Element => {
  const { t } = useTranslation()
  return (
    <div className={classes.success_page}>
      <div className={classes.success_icon}>
        <Image src={successIcon} alt="" width={64} height={64} />
      </div>
      <div className={classes.success_text}>
        {t('session.all_activities_completed')}
      </div>
    </div>
  )
}
