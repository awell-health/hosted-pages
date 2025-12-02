import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { mapActionFieldsToObject } from '../../../utils'
import activityClasses from '../../../../../../styles/ActivityLayout.module.css'
import classes from './remoteSingleSelectAction.module.css'
import type { RemoteSingleSelectActionFields } from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useRemoteSingleSelectAction } from './hooks/useRemoteSingleSelectAction'
import {
  Button,
  HostedPageFooter,
  Option,
  Select,
} from '@awell-health/ui-library'
import { useTranslation } from 'next-i18next'
import { isNil, debounce } from 'lodash'
import { OptionSchema, type SelectOption } from './types'
import { z, ZodError } from 'zod'
import { LogEvent } from '../../../../../utils/logging'
import { useHostedSession } from '../../../../../hooks/useHostedSession'
import { logger } from '../../../../../utils/logging'

interface RemoteSingleSelectActionProps {
  activityDetails: ExtensionActivityRecord
}

export const RemoteSingleSelectAction: FC<RemoteSingleSelectActionProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails

  const { t } = useTranslation()
  const { onSubmit, isSubmitting } = useRemoteSingleSelectAction()
  const { session } = useHostedSession()

  const [selectedOption, setSelectedOption] = useState<SelectOption>()
  const [options, setOptions] = useState<Array<SelectOption>>([])
  const [error, setError] = useState<unknown>(undefined)
  const [searchText, setSearchText] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  const generateUrl = (url: string, queryParam: string, search = '') => {
    return !isNil(queryParam) && search !== ''
      ? `${url}?${queryParam}=${search}`
      : url
  }

  const handleFetchOptions = async (
    url: string,
    queryParam: string,
    headers: string,
    search = ''
  ): Promise<SelectOption[]> => {
    try {
      setError(undefined) // Reset error state
      setLoading(true)
      const response = await fetch(generateUrl(url, queryParam, search), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...JSON.parse(headers),
        },
      })
      const options = await response.json()

      const parsedOptions = z.array(OptionSchema).safeParse(options)

      if (!parsedOptions.success) {
        logger.error(
          `Failed to parse options for remote single select in activity ${activityDetails.id}`,
          LogEvent.REMOTE_SINGLE_SELECT_OPTIONS,
          {
            sessionId: session?.id,
            pathwayId: session?.pathway_id,
            stakeholderId: session?.stakeholder?.id,
            sessionStatus: session?.status,
            activity: activityDetails,
            error: parsedOptions.error,
            response,
          }
        )
        throw new ZodError(parsedOptions.error.issues)
      }

      if (parsedOptions.data.length === 0) {
        logger.warn(
          `No options found for remote single select in activity ${activityDetails.id}`,
          LogEvent.REMOTE_SINGLE_SELECT_OPTIONS,
          {
            sessionId: session?.id,
            pathwayId: session?.pathway_id,
            stakeholderId: session?.stakeholder?.id,
            sessionStatus: session?.status,
            activity: activityDetails,
            response,
          }
        )
        setError('No options found')
      }

      logger.info(
        `Options found for remote single select in activity ${activityDetails.id}`,
        LogEvent.REMOTE_SINGLE_SELECT_OPTIONS,
        {
          sessionId: session?.id,
          pathwayId: session?.pathway_id,
          stakeholderId: session?.stakeholder?.id,
          sessionStatus: session?.status,
          activity: activityDetails,
          response,
        }
      )

      return parsedOptions.data
    } catch (error) {
      if (error instanceof ZodError) {
        console.error(error.issues)
        setError('Failed to parse options for remote single select')
      } else {
        logger.error(
          `Failed to fetch options for remote single select in activity ${activityDetails.id}`,
          LogEvent.REMOTE_SINGLE_SELECT_OPTIONS,
          {
            sessionId: session?.id,
            pathwayId: session?.pathway_id,
            stakeholderId: session?.stakeholder?.id,
            sessionStatus: session?.status,
            activity: activityDetails,
            error: error instanceof Error ? error.message : String(error),
          }
        )
        setError(error)
      }
      return []
    } finally {
      setLoading(false)
    }
  }

  const {
    queryParam,
    url,
    label,
    headers = '{}',
    mandatory,
  } = useMemo(
    () => mapActionFieldsToObject<RemoteSingleSelectActionFields>(fields),
    [fields]
  )

  const fetchOptionsDebounced = debounce(async () => {
    const options = await handleFetchOptions(
      url,
      queryParam,
      headers,
      searchText
    )
    setOptions(options)
  }, 500)

  const handleSubmit = useCallback(() => {
    if (isNil(selectedOption) || isNil(selectedOption.value)) {
      setError(t('activities.form.question_required_error'))
      return
    }
    onSubmit({
      activityId: activity_id,
      selectedOption,
    })
  }, [selectedOption, activity_id, onSubmit, t])

  const handleOptionChange = useCallback(
    (value: number | Array<Option> | string) => {
      const selectedOption = options.find(
        (option) => option.value === value.toString()
      )
      setSelectedOption(selectedOption)
    },
    [options]
  )

  const uiSelectOptions = useMemo(() => {
    return options.map((o) => ({
      id: o.id,
      label: o.label,
      value: o.value,
      value_string: o.value_string,
    }))
  }, [options])

  useEffect(() => {
    fetchOptionsDebounced()
  }, [searchText])

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
              // @ts-expect-error value should be a number but is a string
              options={uiSelectOptions}
              onSearch={(value: string) => {
                setSearchText(value)
              }}
              type="single"
              value={selectedOption?.value ?? ''}
              onChange={handleOptionChange}
              mandatory={mandatory === 'true'}
              filtering
            />
            {!isNil(error) && (
              <div className={classes.error}>{String(error) as string}</div>
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

RemoteSingleSelectAction.displayName = 'RemoteSingleSelectAction'
