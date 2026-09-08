const ALLOWED_PROTOCOLS = new Set(['https:', 'http:'])

/**
 * The redirect target is configured by a care flow designer in Studio and reaches the patient's
 * browser as an extension action field, so it is data, not code we wrote. `window.location.href`
 * would run a `javascript:` value in the patient's session (Aikido AIK_js_xss_location,
 * high). Only http(s) destinations may be navigated to.
 *
 * Relative paths are resolved against the hosted-pages origin so an existing same-origin redirect
 * keeps working; anything that does not parse, or parses to another scheme (`javascript:`,
 * `data:`, `vbscript:`, `blob:`, …), yields `null` and the caller skips the navigation.
 */
export const toSafeRedirectUrl = (
  value: unknown,
  base: string = window.location.origin
): string | null => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (trimmed === '') return null

  let url: URL
  try {
    url = new URL(trimmed, base)
  } catch {
    return null
  }

  return ALLOWED_PROTOCOLS.has(url.protocol) ? url.href : null
}
