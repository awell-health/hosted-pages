import React, { FC, useEffect, useMemo, useState } from 'react'
import { mapActionFieldsToObject } from '../../../utils'
import classes from './remoteSingleSelectAction.module.css'

import type { RemoteSingleSelectActionFields } from '../../types'
import type { ExtensionActivityRecord } from '../../../types'
import { useRemoteSingleSelectAction } from './hooks/useRemoteSingleSelectAction'
import { Button, Select, type Option } from '@awell-health/ui-library'
import { useTranslation } from 'next-i18next'
import { isNil, debounce } from 'lodash'

interface RemoteSingleSelectActionProps {
  activityDetails: ExtensionActivityRecord
}

export const RemoteSingleSelectAction: FC<RemoteSingleSelectActionProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields } = activityDetails
  const { t } = useTranslation()
  const { onSubmit, isSubmitting } = useRemoteSingleSelectAction()
  const [selectedOption, setSelectedOption] = useState<Option>()
  const [options, setOptions] = useState<Array<Option>>([])
  const [error, setError] = useState<unknown>()
  const [searchText, setSearchText] = useState<string>('')

  const handleFetchOptions = async (
    url: string,
    queryParam: string,
    headers: string,
    search = '',
    onError?: (error: unknown) => void
  ) => {
    try {
      const response = await fetch(
        `${url}/${queryParam && search ? '?' + queryParam + '=' + search : ''}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'yes',
            ...JSON.parse(headers),
          },
        }
      )
      const options = await response.json()
      return options
    } catch (error) {
      console.error(error)
      if (!isNil(onError)) {
        onError(error)
      }
    }
  }

  const {
    queryParam,
    url,
    label,
    headers = '{}',
    mandatory = false,
  } = useMemo(
    () => mapActionFieldsToObject<RemoteSingleSelectActionFields>(fields),
    [fields]
  )

  const fetchOptions = debounce(async () => {
    const options = await handleFetchOptions(
      url,
      queryParam,
      headers,
      searchText,
      setError
    )
    setOptions(options)
  }, 1000)

  const handleSubmit = () => {
    if (isNil(selectedOption) || isNil(selectedOption.value)) {
      setError(t('activities.form.question_required_error'))
      return
    }
    onSubmit({
      activityId: activity_id,
      label: selectedOption.label,
      value: selectedOption.value.toString(),
    })
  }

  console.log(mandatory)

  useEffect(() => {
    if (searchText.length > 3) {
      fetchOptions()
    }
  }, [searchText])

  if (!activityDetails || !activityDetails.fields || !options) {
    return null
  }

  return (
    <div className={classes.container}>
      <div className={classes.selectContainer}>
        <Select
          id="select"
          labels={{
            questionLabel: label,
            noOptions: t('activities.form.questions.select.no_options'),
            searchPlaceholder: t(
              'activities.form.questions.select.type_to_search'
            ),
          }}
          options={options}
          onSearch={(value) => {
            setSearchText(value)
          }}
          type="single"
          value={selectedOption?.value}
          onChange={(value) => {
            const selectedOption = options.find(
              (option) => option.value.toString() === value.toString()
            )
            setSelectedOption(selectedOption)
          }}
          mandatory={mandatory === 'true'}
          filtering
        />

        {!isNil(error) && (
          <div className={classes.error}>{String(error) as string}</div>
        )}
      </div>
      <div className={classes.buttonContainer}>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {t('activities.form.cta_submit')}
        </Button>
      </div>
    </div>
  )
}

RemoteSingleSelectAction.displayName = 'RemoteSingleSelectAction'
