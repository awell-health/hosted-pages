import React, { FC } from 'react'
import { useTranslation } from 'next-i18next'

import { ErrorPage } from '../ErrorPage'
import { CalDotComExtension } from './CalDotComExtension'
import { useExtensionActivity } from '../../hooks/useExtensionActivity'
import { LoadingPage } from '../LoadingPage'

import { type Activity, ExtensionKey, AnonymousActionKeys } from './types'
import { FormsortExtension } from './FormsortExtension'
import { DropboxSignExtension } from './DropboxSignExtension'
import { CloudinaryExtension } from './CloudinaryExtension'
import { DocuSignExtension } from './DocuSignExtension'
import { CollectDataExtension } from './CollectDataExtension'
import { ExperimentalExtension } from './ExperimentalExtension'
import { EnterMedication } from './ExperimentalExtension/actions'

interface ExtensionProps {
  activity: Activity
}

export const Extension: FC<ExtensionProps> = ({ activity }) => {
  const { t } = useTranslation()
  const { loading, extensionActivityDetails, error, refetch } =
    useExtensionActivity(activity.object.id)

  if (loading) {
    return <LoadingPage />
  }

  if (error || !extensionActivityDetails) {
    return (
      <ErrorPage
        title={t('activities.checklist.loading_error', { error })}
        onRetry={refetch}
      />
    )
  }

  const getDefaultReturnValue = () => {
    switch (extensionActivityDetails.plugin_action_key) {
      case AnonymousActionKeys.COLLECT_MEDICATION:
        return <EnterMedication activityDetails={extensionActivityDetails} />
      default:
        return <ErrorPage title={t('activities.activity_not_supported')} />
    }
  }

  switch (activity?.indirect_object?.id) {
    case ExtensionKey.CAL_DOT_COM:
      return <CalDotComExtension activityDetails={extensionActivityDetails} />
    case ExtensionKey.DROPBOXSIGN:
      return <DropboxSignExtension activityDetails={extensionActivityDetails} />
    case ExtensionKey.CLOUDINARY:
      return <CloudinaryExtension activityDetails={extensionActivityDetails} />
    case ExtensionKey.FORMSORT:
      return <FormsortExtension activityDetails={extensionActivityDetails} />
    case ExtensionKey.DOCU_SIGN:
      return <DocuSignExtension activityDetails={extensionActivityDetails} />
    case ExtensionKey.COLLECT_DATA:
      return <CollectDataExtension activityDetails={extensionActivityDetails} />
    case ExtensionKey.EXPERIMENTAL:
      return (
        <ExperimentalExtension activityDetails={extensionActivityDetails} />
      )
    default:
      return getDefaultReturnValue()
  }
}

Extension.displayName = 'Extension'
