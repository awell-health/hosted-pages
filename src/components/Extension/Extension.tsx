import React, { FC } from 'react'
import { useTranslation, TFunction } from 'next-i18next'

import { ErrorPage } from '../ErrorPage'
import { CalDotComExtension } from './CalDotComExtension'
import { useExtensionActivity } from '../../hooks/useExtensionActivity'
import { LoadingPage } from '../LoadingPage'

import {
  type Activity,
  type ExtensionActivityRecord,
  ExtensionKey,
  AnonymousActionKeys,
} from './types'
import { FormsortExtension } from './FormsortExtension'
import { DropboxSignExtension } from './DropboxSignExtension'
import { CloudinaryExtension } from './CloudinaryExtension'
import { DocuSignExtension } from './DocuSignExtension'
import { CollectDataExtension } from './CollectDataExtension'
import { ExperimentalExtension } from './ExperimentalExtension'
import {
  IntakeScheduling,
  EnterMedication as PrivateEnterMedication,
  PatientRecommendation as PrivatePatientRecommendation,
  Redirect as PrivateRedirect,
} from './PrivateExtensions/actions'
import { StripeExtension } from './StripeExtension'
import { IdentityVerification } from './IdentityVerification'
import { ShellyExtension } from './ShellyExtension'
import { RequestingProviderLookUp } from './PrivateExtensions/WP'
import { WaitForActivityToComplete } from './SharedActions'
import { RemoteExtensionLoader } from './RemoteExtensionLoader'

interface ExtensionProps {
  activity: Activity
}

/**
 * Fallback component used when the extension is not available in the remote manifest.
 * This includes legacy extensions with local implementations and private/anonymous actions.
 */
const ExtensionFallback: FC<{
  activity: Activity
  extensionActivityDetails: ExtensionActivityRecord
  t: TFunction
}> = ({ activity, extensionActivityDetails, t }) => {
  // Private/anonymous action handlers
  const getPrivateActionComponent = () => {
    switch (extensionActivityDetails.plugin_action_key) {
      case AnonymousActionKeys.COLLECT_MEDICATION:
        return (
          <PrivateEnterMedication activityDetails={extensionActivityDetails} />
        )
      case AnonymousActionKeys.PATIENT_RECOMMENDATION:
        return (
          <PrivatePatientRecommendation
            activityDetails={extensionActivityDetails}
          />
        )
      case AnonymousActionKeys.REDIRECT:
        return <PrivateRedirect activityDetails={extensionActivityDetails} />
      case AnonymousActionKeys.INTAKE_SCHEDULING:
        return <IntakeScheduling activityDetails={extensionActivityDetails} />
      case AnonymousActionKeys.WP_REQUESTING_PROVIDER_LOOKUP:
        return (
          <RequestingProviderLookUp
            activityDetails={extensionActivityDetails}
          />
        )
      case AnonymousActionKeys.START_CARE_FLOW_AND_SESSION:
        return (
          <WaitForActivityToComplete
            activityDetails={extensionActivityDetails}
          />
        )
      default:
        return null
    }
  }

  // Legacy extensions with local implementations
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
    case ExtensionKey.STRIPE:
      return <StripeExtension activityDetails={extensionActivityDetails} />
    case ExtensionKey.IDENTITY_VERIFICATION:
      return <IdentityVerification activityDetails={extensionActivityDetails} />
    case ExtensionKey.EXPERIMENTAL:
      return (
        <ExperimentalExtension activityDetails={extensionActivityDetails} />
      )
    case ExtensionKey.SHELLY:
      return <ShellyExtension activityDetails={extensionActivityDetails} />
    default: {
      // Check for private/anonymous actions
      const privateComponent = getPrivateActionComponent()
      if (privateComponent) {
        return privateComponent
      }
      return (
        <ErrorPage title={String(t('activities.activity_not_supported'))} />
      )
    }
  }
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

  const componentId = `${extensionActivityDetails.plugin_key}.${extensionActivityDetails.plugin_action_key}`

  // Always try to load from remote manifest first.
  // If not available in manifest, fall back to legacy local implementations.
  return (
    <RemoteExtensionLoader
      componentId={componentId}
      activityDetails={extensionActivityDetails}
      fallback={
        <ExtensionFallback
          activity={activity}
          extensionActivityDetails={extensionActivityDetails}
          t={t}
        />
      }
      key={activity.id}
    />
  )
}

Extension.displayName = 'Extension'
