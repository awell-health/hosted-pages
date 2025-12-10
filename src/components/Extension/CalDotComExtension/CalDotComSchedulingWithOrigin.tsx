import React, { ComponentProps, FC } from 'react'
import { CalDotComScheduling } from '@awell-health/ui-library'

type BaseProps = ComponentProps<typeof CalDotComScheduling>

type ExtendedProps = BaseProps & {
  /**
   * Base URL for your Cal.com deployment.
   * Defaults to 'https://cal.com' but can be overridden for enterprise
   * Cal.com accounts with custom domains (e.g., 'https://joinavela.cal.com').
   *
   * Note: This prop is passed through to CalDotComScheduling once
   * @awell-health/ui-library is updated to support it.
   */
  calOrigin?: string
}

/**
 * Wrapper component for CalDotComScheduling that adds support for calOrigin.
 *
 * This wrapper exists to bridge the gap between hosted-pages needing to pass
 * calOrigin and the currently installed @awell-health/ui-library version not
 * yet supporting it.
 *
 * Once @awell-health/ui-library is updated with calOrigin support, this wrapper
 * can be updated to pass calOrigin through, or removed entirely.
 */
export const CalDotComSchedulingWithOrigin: FC<ExtendedProps> = ({
  calOrigin: _calOrigin,
  ...rest
}) => {
  // TODO: Once @awell-health/ui-library is updated to support calOrigin,
  // pass it through to CalDotComScheduling:
  // return <CalDotComScheduling {...rest} calOrigin={calOrigin} />

  // For now, we accept calOrigin in props but don't pass it through
  // since the current ui-library version doesn't support it yet.
  // The _calOrigin prefix indicates it's intentionally unused.
  void _calOrigin
  return <CalDotComScheduling {...rest} />
}

CalDotComSchedulingWithOrigin.displayName = 'CalDotComSchedulingWithOrigin'
