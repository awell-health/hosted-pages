import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import type { ExtensionActivityRecord } from '../../../types'
import { useRequestingProviderLookUp } from './hooks/useRequestingProviderLookUp'
import { mapActionFieldsToObject } from '../../../utils'
import { ProvidersResponse, type ActionFields, type Provider } from './types'
import '@awell-health/sol-scheduling/style.css'
import { useHostedSession } from '../../../../../hooks/useHostedSession'
import { isNil } from 'lodash'
import {
  HostedSessionError,
  captureHostedSessionError,
} from '../../../../../utils/errors'
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

type ErrorType = {
  type: 'required' | 'api'
  message: string
}

export const RequestingProviderLookUp: FC<ActivityProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails

  const { t } = useTranslation()
  const { session, metadata } = useHostedSession()
  const { onSubmit, isSubmitting } = useRequestingProviderLookUp()

  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<ErrorType | undefined>(undefined)
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

  /**
   * If there's an API error, we allow the user to submit the activity
   * so they are not blocked.
   */
  const isRequired = useMemo(() => {
    if (required !== 'true') return false
    if (error !== undefined && error.type === 'api') return false
    return required === 'true'
  }, [required, error])

  const handleSubmit = useCallback(() => {
    if (isRequired && isNil(selectedProvider)) {
      setError({
        type: 'required',
        message: t('activities.form.question_required_error'),
      })
      return
    }

    onSubmit({
      activityId: activity_id,
      providerReference: selectedProvider?.reference,
      providerFullName: selectedProvider?.provider,
      providerId: selectedProvider?.reference.split('/')[1],
    })
  }, [selectedProvider, activity_id, onSubmit, t, isRequired])

  const handleFetchProviders = useCallback(async () => {
    try {
      // Reset error state
      setError(undefined)
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
        setError({
          type: 'api',
          message:
            "No providers were found. You can try reloading the page or if that doesn't work leave the requesting provider blank and complete it later in ERMA.",
        })
        return
      }

      if (!response.ok) {
        setError({
          type: 'api',
          message:
            "Something went wrong while fetching providers. You can try reloading the page or if that doesn't work leave the requesting provider blank and complete it later in ERMA.",
        })
        return
      }

      const options = (await response.json()) as ProvidersResponse
      return options
    } catch (error) {
      // Try to extract siteId from patient if available
      let siteId: string | undefined
      try {
        const patientObject = JSON.parse(patient)
        siteId = patientObject?.site?.Id
      } catch {
        // Ignore parsing errors
      }

      const hostedSessionError = new HostedSessionError(
        'Failed to fetch requesting providers',
        {
          errorType: 'WP_REQUESTING_PROVIDER_FETCH_FAILED',
          activityId: activityDetails.id,
          originalError: error,
          contexts: {
            activity: activityDetails,
            wp: {
              siteId,
            },
          },
        }
      )
      captureHostedSessionError(hostedSessionError)
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
              mandatory={isRequired}
              filtering
            />
            {!isNil(error) && (
              <div className={classes.error}>
                {String(error.message) as string}
              </div>
            )}
          </div>
        </div>
      </main>
      <HostedPageFooter hideScrollHint={true}>
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
