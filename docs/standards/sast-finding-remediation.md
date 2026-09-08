# SAST findings — the hosted-pages register

Companion to the `awell-security` plugin's `sast-remediation` skill. This file is the part the skill
cannot carry: what is specific to **this** repository — which findings are deliberately suppressed
or left open and why, and the traps that cost time here. Update it in the same PR as the
suppression it describes.

## This repo in Aikido

- **Repo name:** `hosted-pages`, GitHub group **6344** (the `?groupId=` in every `issue_link`; the
  GitLab repos and the container registry are other groups and never appear in the same list).
  `aikido_issues_list(issue_types=['sast'], repo_name='hosted-pages')`.

## Suppressed in code with `// nosemgrep`

| Finding                                                                                | Where                                                                                                                         | Fix that shipped                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Why the rule still fires                                                                                                                                                                                                                                                                |
| -------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 159336707 (high, 75) — `AIK_js_xss_location`, "Potential XSS via window.location.href" | `src/components/Extension/SharedActions/Redirect/Redirect.tsx`, the `window.location.href =` assignment in `handleCompletion` | The destination is the extension action's `redirectUrl` field — configured by a care flow designer in Studio and delivered to the patient's browser through the orchestration API, so it is data, not code we wrote — and it used to be assigned as-is. `toSafeRedirectUrl()` (same directory) now runs first: the value is trimmed, parsed with `new URL(value, window.location.origin)`, and **only `https:`/`http:` results are returned**; `javascript:`, `data:`, `vbscript:`, `blob:`, `file:`, unparseable and empty values yield `null`, in which case the activity is still completed (so the care flow moves on) and a `REDIRECT_URL_REFUSED` warning goes to Sentry with the activity id instead of navigating. Unit tests in `toSafeRedirectUrl.test.ts` (7 cases, 2026-09-08). | `AIK_js_xss_location` is a **sink detector**: it fires on any non-literal assigned to `window.location.href`, regardless of the guard in front of it — verified with `aikido_full_scan` on the patched file _without_ the `nosemgrep` line (still flagged at 75) and _with_ it (clean). |

**When this reasoning stops holding:** if the assignment ever takes anything other than the return
value of `toSafeRedirectUrl`, or if that helper's allowlist grows beyond `https:`/`http:`, the
suppression is no longer justified — remove it and re-scan.

## Left open with a reason

_None._

## Deferred

_None._

## Repo-specific traps

- **`new URL(value).href` normalises.** A bare `https://example.com` becomes `https://example.com/`,
  spaces in paths are percent-encoded. Navigation is equivalent; string-equality checks on the
  destination are not.
- Tests are `vitest run` (jsdom, `test/setup.ts` seeds `sessionStorage`). Type-check is
  `npx tsc --noEmit -p .`; the repo has no `typecheck` script.
