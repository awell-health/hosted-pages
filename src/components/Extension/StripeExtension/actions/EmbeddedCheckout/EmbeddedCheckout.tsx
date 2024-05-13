import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import classes from './EmbeddedCheckout.module.css'

import type { ExtensionActivityRecord } from '../../../types'
import { useEmbeddedCheckout } from './hooks/useEmbeddedCheckout'
import { useTheme } from '@awell-health/ui-library'
import { loadStripe, Stripe } from '@stripe/stripe-js'
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout as StripeEmbeddedCheckout,
} from '@stripe/react-stripe-js'
import { useRouter } from 'next/router'
import { mapActionFieldsToObject, mapSettingsToObject } from '../../../utils'
import {
  EmbeddedCheckoutActionFields,
  StripeExtensionSettings,
} from '../../types'

interface EmbeddedCheckoutProps {
  activityDetails: ExtensionActivityRecord
}

export const EmbeddedCheckout: FC<EmbeddedCheckoutProps> = ({
  activityDetails,
}) => {
  const { activity_id, fields, settings } = activityDetails

  const [stripe, setStripe] = useState<Stripe | null>(null)

  const { onSubmit } = useEmbeddedCheckout()
  const router = useRouter()
  const { updateLayoutMode, resetLayoutMode } = useTheme()

  const { item, mode } = useMemo(
    () => mapActionFieldsToObject<EmbeddedCheckoutActionFields>(fields),
    [fields]
  )

  const {
    liveModePublishableKey,
    testModePublishableKey,
    mode: stripeMode,
    hostedPagesEnvironmentVariable,
  } = useMemo(
    () => mapSettingsToObject<StripeExtensionSettings>(settings),
    [fields]
  )

  const fetchClientSecret = useCallback(() => {
    return fetch('/api/stripe/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        hostedPagesSessionId: router.query.sessionId,
        stripeMode,
        mode,
        item,
        hostedPagesEnvironmentVariable,
      }),
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret)
  }, [])

  const options = { fetchClientSecret }

  const handleSubmit = useCallback(() => {
    onSubmit({
      activityId: activity_id,
      success: true,
    })
  }, [activity_id, onSubmit])

  useEffect(() => {
    updateLayoutMode('flexible')

    loadStripe(
      stripeMode === 'Test' ? testModePublishableKey : liveModePublishableKey
    ).then((stripeInstance) => {
      setStripe(stripeInstance)
    })

    /**
     * If this is set in the URL,
     * then we know it's a callback from Stripe
     */
    const { stripeSessionId } = router.query

    if (stripeSessionId) {
      fetch(
        `/api/stripe/session?stripeSessionId=${stripeSessionId}&hostedPagesEnvironmentVariable=${hostedPagesEnvironmentVariable}&stripeMode=${stripeMode}`,
        {
          method: 'GET',
        }
      )
        .then((res) => res.json())
        .then((data) => {
          /** Complete the activity when payment was successful */
          if (data.status === 'complete') {
            handleSubmit()
          }
        })
    }

    return () => {
      resetLayoutMode()
    }
  }, [router.query, updateLayoutMode, resetLayoutMode])

  return (
    <div>
      {stripe && options && (
        <div className={`${classes.container}`}>
          <EmbeddedCheckoutProvider stripe={stripe} options={options}>
            <StripeEmbeddedCheckout />
          </EmbeddedCheckoutProvider>
          <br />
          <br />
        </div>
      )}
    </div>
  )
}

EmbeddedCheckout.displayName = 'EnterMedication'
