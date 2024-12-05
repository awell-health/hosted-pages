import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import type { ExtensionActivityRecord } from '../../../types'
import { useRequestingProviderLookUp } from './hooks/useRequestingProviderLookUp'
import { mapActionFieldsToObject } from '../../../utils'
import { ProvidersResponse, type ActionFields, type Provider } from './types'
import '@awell-health/sol-scheduling/style.css'
import { useHostedSession } from '../../../../../hooks/useHostedSession'
import { isNil } from 'lodash'
import classes from './RequestingProviderLookUp.module.css'
import {
  type Option,
  Select,
  Button,
  HostedPageFooter,
} from '@awell-health/ui-library'
import { useTranslation } from 'next-i18next'
import activityClasses from '../../../../../../styles/ActivityLayout.module.css'

interface ActivityProps {
  activityDetails: ExtensionActivityRecord
}

export const RequestingProviderLookUp: FC<ActivityProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails

  const { t } = useTranslation()
  const { session, metadata } = useHostedSession()
  const { onSubmit, isSubmitting } = useRequestingProviderLookUp()

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<unknown>()
  const [providers, setProviders] = useState<Provider[]>([])
  const [selectedProviderId, setSelectedProviderId] =
    useState<Provider['reference']>()

  const { patient, label, required } =
    mapActionFieldsToObject<ActionFields>(fields)

  const selectedProvider = useMemo(() => {
    if (selectedProviderId === undefined) return undefined

    return providers?.find((provider) =>
      provider.reference.includes(selectedProviderId)
    )
  }, [providers, selectedProviderId])

  const providerOptions = useMemo((): Array<Option> => {
    return providers?.map((provider) => {
      const providerId = provider.reference.split('/')[1]

      return {
        id: provider.reference,
        label: provider.provider,
        value: Number(providerId),
        value_string: providerId,
      }
    })
  }, [providers])

  const handleSubmit = useCallback(() => {
    if (required === 'true' && isNil(selectedProvider)) {
      setError(t('activities.form.question_required_error'))
      return
    }

    onSubmit({
      activityId: activity_id,
      providerReference: selectedProvider?.reference,
      providerFullName: selectedProvider?.provider,
      providerId: selectedProvider?.reference.split('/')[1],
    })
  }, [selectedProvider, activity_id, onSubmit, t, required])

  const handleFetchProviders = useCallback(async () => {
    try {
      setLoading(true)

      const patientObject = JSON.parse(patient)
      const siteId = patientObject?.site.Id

      const response = await fetch(
        `/api/wp/lookup/providers/${siteId}?session=${session?.id}&pathway=${session?.pathway_id}&tenant=${metadata?.tenant_id}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      if (response.status === 404) {
        setError('No providers were found, try reloading the page.')
        return
      }

      if (!response.ok) {
        setError(
          'Something went wrong while fetching providers, try reloading the page.'
        )
        return
      }

      const options = (await response.json()) as ProvidersResponse
      return options
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }, [patient, session, metadata])

  useEffect(() => {
    async function fetchData() {
      const providers = await handleFetchProviders()
      setProviders(providers?.data ?? [])
    }
    fetchData()
  }, [handleFetchProviders])

  return (
    <>
      <main
        id="ahp_main_content_with_scroll_hint"
        className={activityClasses.main_content}
      >
        <div className={classes.container}>
          <div>
            <Select
              id="select"
              labels={{
                questionLabel: label,
                noOptions: t('activities.form.questions.select.no_options'),
                placeholder: t(
                  'activities.form.questions.select.type_to_search'
                ),
                loading: t('activities.form.questions.select.loading'),
              }}
              loading={loading}
              options={providerOptions}
              type="single"
              value={selectedProviderId}
              onChange={(value) => {
                const selectedOption = providerOptions.find(
                  (option) => option.value.toString() === value.toString()
                )
                setSelectedProviderId(selectedOption?.value_string)
              }}
              mandatory={required === 'true'}
              filtering
            />
            {!isNil(error) && (
              <div className={classes.error}>{String(error) as string}</div>
            )}
          </div>
        </div>
      </main>
      <HostedPageFooter showScrollHint={false}>
        <div
          className={`${activityClasses.button_wrapper} ${classes.container}`}
        >
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {t('activities.form.cta_submit')}
          </Button>
        </div>
      </HostedPageFooter>
    </>
  )
}

RequestingProviderLookUp.displayName = 'RequestingProviderLookUp'
