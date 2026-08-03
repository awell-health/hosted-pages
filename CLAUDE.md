# hosted-pages

Next.js 14 (pages router) app that renders an Awell **hosted session**: the patient- or
clinician-facing page reached via `https://goto.<region>.awell.health/?sessionId=…`. It walks the
stakeholder through the session's activities (messages, forms, checklists, extensions) and then
redirects to the integrator's `success_url` / `cancel_url`.

State comes from the orchestration GraphQL API over both HTTP (queries/mutations) and a
`graphql-ws` websocket (subscriptions).

## Commands

```bash
yarn dev              # local dev server
yarn test             # vitest run (jsdom + React Testing Library)
yarn test:watch
yarn tsc --noEmit     # typecheck
yarn lint             # next lint (eslint + prettier)
yarn pre-commit       # typecheck + lint + test
yarn codegen          # regenerate src/types/generated/** from ../awell-next schema
```

`codegen.yml` reads the schema from a **sibling checkout** (`../awell-next/packages/pathway-orchestration/orchestration-schema.graphql`). Codegen fails without it; the generated files are committed, so you rarely need to run it.

Commits run `lint-staged` (typecheck + eslint + `vitest related`) via husky. CI (`.github/workflows/ci.yml`) runs typecheck, lint and the full test suite on every PR.

---

## Session state: two independent paths

Session status reaches the UI two ways. They look redundant. **They are not.**

| Path     | Mechanism                                                                                                                           | Where                                                                            |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Poll** | `useGetHostedSessionQuery` + Apollo `startPolling(2000)`, registered through `ConnectivityContext` so it pauses when offline/hidden | `pages/index.tsx` (polling registration), `src/contexts/ConnectivityContext.tsx` |
| **Push** | `useOnHostedSessionCompletedSubscription` / `…ExpiredSubscription` → `client.writeQuery`                                            | `src/hooks/useHostedSession/useHostedSession.ts`                                 |

The push path only writes to the Apollo **cache**. The page reads the session exclusively from the
value `useHostedSession()` returns. So whenever the query observable is wedged, the push path is
powerless even though the browser already has the answer.

> **Invariant: a terminal session status, once known from any source, must reach the page.**
> Never let query transport state (`loading`, `error`, cancellation, or a stale delivered result)
> suppress an already-known terminal status.

`useHostedSession` therefore keeps the terminal session in React state (`terminalSession`) and
prefers it over `data?.hostedSession?.session` whenever the query is still reporting a
non-terminal status. Don't "simplify" that back to reading `data` alone — see the deadlock below.

`useSessionActivities` is the pattern to copy for new hooks: it returns `activities` and `loading`
side by side, never early-returns, and merges subscription data with Apollo's own `subscribeToMore`
rather than a manual `writeQuery`.

## `cancelPendingRequests()` is a one-way door

`createGraphQLRequestLifecycle()` (`src/services/graphql/apollo-client.ts`) tracks every in-flight
request. `cancelPendingRequests()` sets `isTerminated = true` **forever** — it is never reset — and:

- aborts every request tracked with the `abort` policy,
- disposes the websocket clients,
- causes `requestLifecycleLink` to reject all _future_ operations with `GraphQLRequestCancelledError`.

This is intentional: it stops doomed writes against a dead session (`2d6c3b5 fix: safely tear down expired session requests (#435)`). Consequences to internalise:

- **Treat it as process teardown, not a retryable action.** Anything the UI still needs must
  already be in the cache — and reachable without a new request — before you call it.
- Any state machine that waits on a future request will hang. `RetryLink` will not save you:
  `retryIf` deliberately returns `false` for cancellations.
- Requests that must _not_ be killed mid-flight (patient-data writes) opt into the `settle` policy
  via `context.requestLifecyclePolicy = 'settle'`, and `finalizeTerminalGraphQLRequests` waits for
  them (`waitForSettlingRequests`) before credentials are cleared and the redirect fires.

### The deadlock this cost us once (fixed — keep it fixed)

Reference failure: Checkly `[production-us] app-hosted-pages - walkthrough`, 2026-08-03 09:14 UTC,
session `GpQ2OeoFxwm9`. The backend was blameless — orchestration published `sessionCompleted`
22 ms after completing the session.

1. The frame arrived **while a `GetHostedSession` poll was in flight**.
2. `handleTerminalSession` → `cancelPendingRequests()` aborted that poll.
3. Apollo parked the observable on the cancellation (`networkStatus: 8` / `error`) and kept serving
   the **last pre-completion snapshot**. `loading` was `false`; `error` was suppressed by the
   existing `isGraphQLRequestCancellation` guard.
4. `isTerminated` blocked every subsequent request, so nothing ever reconciled the observable with
   the cache — which _did_ hold `COMPLETED`. The Playwright trace shows **zero requests** for the
   remaining 27 s.
5. The hook returned `status: ACTIVE` forever → `shouldRedirect` stayed `false` → no redirect, and
   `ActivityProvider` kept polling for an activity that would never come, rendering the skeleton.

Note what this was _not_: not a `loading: true` hang, and not the `LoadingPage` in `pages/index.tsx`.
Apollo also **suppresses cache-driven notifications while a request is in flight** (`QueryInfo.shouldNotify`
returns false for `cache-first`), so writing to the cache before teardown is necessary but not
sufficient on its own.

Regression tests: `src/hooks/useHostedSession/useHostedSession.test.tsx`.

## Rendering precedence

`pages/index.tsx` checks these in order — an earlier branch masks every later one:

1. `terminalWriteError` → `ErrorPage` (patient writes could not be finalised)
2. `!isSessionTerminal && hasNetworkError && networkErrorCount >= 3` → `NetworkErrorGate`
3. `!isSessionTerminal && showInvalidSession` → `InvalidSessionGate`
4. `sessionLoading` → `<LoadingPage showLogoBox={true} />`
5. otherwise → `SessionRouter` (switches on `session.status`), plus `ErrorPage` when `error` is set

**There are two different skeletons.** Inside `SessionRouter`'s `Active` branch,
`ActivitiesContainer` renders its own `<LoadingPage />` (no logo box) from two places:

- `ActivityProvider` while the activities query is loading, and
- `Activities` while `state === 'polling' | 'polling-extended'` — i.e. no active activity yet.

A screenshot of "logo + three grey bars" is ambiguous between (4) and the `Activities` one, because
`HostedPageLayout` draws the logo in either case. Check whether `session.status` is `ACTIVE` before
concluding which. In the reference failure it was the `Activities` one.

An aborted request produces **none** of the error states above — no error UI, and the network-error
gate never trips. That silence is the signature, not the absence of a problem.

## Observability

Conventions (never log during render, always `Sentry.logger?.` with optional chaining, always
include error details) live in `.cursor/rules/observability-best-practices.mdc` — follow it; it is
not duplicated here. Use `logger` from `src/utils/logging.ts` with a `LogEvent`, which also attaches
session context from `sessionStorage['log-context']`.

Events worth knowing when debugging a stuck session:

| `LogEvent`                                       | Meaning                                                                                                                |
| ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| `GRAPHQL_REQUESTS_ABORTED`                       | `cancelPendingRequests()` aborted N in-flight requests, with operation names. The client goes silent right after this. |
| `SESSION_TERMINAL_STATUS_DIVERGED`               | The push path knows the session ended but the query still reports an older status — the deadlock's fingerprint.        |
| `SESSION_QUERY_STALLED`                          | `useGetHostedSessionQuery` stayed loading past ~3 poll intervals: wedged, not slow.                                    |
| `SESSION_START_POLLING` / `SESSION_STOP_POLLING` | Polling lifecycle, incl. connectivity-driven pauses.                                                                   |
| `GRAPHQL_WS_*`                                   | Websocket connect/retry/keepalive.                                                                                     |

## Branch topology

Work lands on `main`, then flows out via merge commits:

```
main → staging → production / production-us / production-uk / sandbox
```

`.github/workflows/*-deployment.yml` do the merges (`production-deployment.yml` can also hotfix
straight from `main`). Verified as of 2026-08-03:

- `main` **is** an ancestor of every deploy branch; no deploy branch is an ancestor of `main`.
- App code (`src/`, `pages/`, `lib/`) is currently **byte-identical** across `main`, `staging`,
  `production`, `production-us`, `production-uk`.

So a Sentry `release` SHA points at a merge commit that does **not** exist on `main`, even when the
file contents match exactly. Confirm which branch you are reasoning about — and prefer diffing
paths (`git diff main origin/production -- src pages`) over comparing SHAs — before concluding
"the code doesn't do that".

## Diagnosing a red Checkly check

The Checkly CLI is the fastest path from a red check to root cause (`npx checkly whoami` to confirm
you are on the **Awell** account):

```bash
npx checkly checks get <check-id> --result <result-id> --output json
npx checkly assets list     --check-id <check-id> --result-id <result-id>
npx checkly assets download --check-id <check-id> --result-id <result-id> --dir ./tmp
# unzip assets.zip, then unzip traces/*.zip
#   1-trace.network → every request with operationName + status (-1 == aborted)
#   1-trace.trace   → screencast-frame entries are timestamped JPEGs in resources/
```

**Fingerprint of a client-side abort:** a request with `status -1` followed by _no further
requests at all_. That is `cancelPendingRequests()`, not a network problem — and it leaves no error
UI, so the page just sits there. Cross-check against `GRAPHQL_REQUESTS_ABORTED` in Sentry logs.

## Testing

Vitest + React Testing Library, jsdom, config in `vitest.config.ts`, globals set up in
`test/setup.ts` (session storage token + `TEST_DISABLE_SUBSCRIPTIONS`). Tests live next to the code
as `*.test.ts(x)`.

`test/hostedSessionHarness.tsx` mounts `HostedSessionProvider` against the **real** `createClient`
link chain, deliberately _not_ `MockedProvider` — the bugs in this area live in the interaction
between the request lifecycle links, `AbortController` and Apollo's polling observable, which
`MockedProvider` replaces wholesale. It gives you:

- `fetchController` — every GraphQL request stays in flight until you resolve/fail it, so "a poll is
  in flight right now" is deterministic; aborts reject with a real `AbortError`.
- `subscriptionController.emit('OnHostedSessionCompleted', …)` — push frames on demand.
- `readCachedStatus()` / `current()` — assert cache and hook state separately, which is exactly the
  distinction that matters for the invariant above.
