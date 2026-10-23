import { ThemeProvider } from '@awell-health/ui-library'
import type { GetServerSideProps, NextPage } from 'next'
import { serverSideTranslations } from 'next-i18next/serverSideTranslations'
import { ServiceNoticePage } from '../src/components/ServiceNoticePage'
import { AWELL_BRAND_COLOR } from '../src/config'
import {
  readServiceNotice,
  ServiceNoticeCopy,
  ServiceNoticeTemplate,
} from '../src/services/serviceNotice'
import { validateLocale } from '../src/utils'

/**
 * Where middleware.ts sends patients while the service notice is in `block`
 * mode. It must not depend on orchestration: no session, no branding, no
 * GraphQL. Hence no customer logo either; the copy says "our service" for the
 * same reason.
 */
interface UnavailableProps {
  template: ServiceNoticeTemplate
  message: ServiceNoticeCopy | null
}

const Unavailable: NextPage<UnavailableProps> = ({ template, message }) => (
  <ThemeProvider accentColor={AWELL_BRAND_COLOR}>
    <ServiceNoticePage template={template} message={message ?? undefined} />
  </ThemeProvider>
)

export default Unavailable

export const getServerSideProps: GetServerSideProps<UnavailableProps> = async ({
  locale,
  res,
}) => {
  const validatedLocale = validateLocale(locale as string)
  const notice = await readServiceNotice()

  // Tell monitors and crawlers this is temporary, not the page itself.
  res.statusCode = 503
  res.setHeader('Retry-After', '300')

  return {
    props: {
      ...(await serverSideTranslations(validatedLocale, ['common'])),
      template: notice.template,
      message: notice.message?.[validatedLocale] ?? null,
    },
  }
}
