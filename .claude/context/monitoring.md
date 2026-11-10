# Monitoring (Sentry) — spec 106

Goal: an unexpected web error reaches Sentry with the original `.tsx` file and line, release, environment, user id, active owner, a readable title and a trace shared with the API, and **no personal or financial data**. API side: `../life-planner-back/.claude/context/monitoring.md`.

## Projects, releases, environments

- One Sentry project per repo (`life-planner` web here), same organization, sentry.io. Production is the web build only.
- Release `life-planner@<package.json version>` (the app version of Settings, spec 056), `dist: "web"`, environment `EXPO_PUBLIC_SENTRY_ENVIRONMENT` (`staging`/`production`). It maps to the git tag `vX.Y.Z` of the release workflow; no `set-commits`.
- Source maps: `Dockerfile.web` exports with `--source-maps`, injects debug ids and uploads them (`sentry-cli`) for the release, then deletes every `.map` from `dist/`. `SENTRY_AUTH_TOKEN` (no `EXPO_PUBLIC_` prefix; scopes: release and source map upload) is a build arg used only in the builder stage; never in the bundle, `app.config.ts`, the runtime image or logs. Missing token: one warning, build succeeds.

## Code (all in `src/infrastructure/monitoring`; nothing else imports Sentry)

- `sentry/initialize.ts`: release, dist, `sendDefaultPii: false`, `beforeSend` (drops expected errors, runs the scrubber), `beforeBreadcrumb` (scrubber; console breadcrumbs only warning/error), `tracePropagationTargets` = `EXPO_PUBLIC_API_URL` only.
- `sentry/scrub.ts`: privacy scrubber (`q` → `[redacted]`, forbidden keys dropped, request body/cookies/auth removed, user = id only). `sentry/errorDetails.ts`: `isExpectedError` (every `BusinessError`: `ApiBusinessError`, `ConnectivityError`, `UserNotLogged` are never events) and `buildCaptureOptions` (context `error_context`, tag `error_code`, fingerprint, title of default-message errors). `captureException` and the ErrorBoundary (`sentryPrepareBoundaryScope`) share it.
- `infrastructure/api/client.ts`: a 5xx/unexpected status becomes `GenericError` titled `HTTP <status> <METHOD> <route>` (UUIDs/numbers → `:id`, no query string, invite token redacted), fingerprint `["api", method, route, status]`.
- `fetcher/useMutation.ts`: `variables` never reach the context, only `variableKeys`. A failed query/mutation adds a breadcrumb (`category: "query" | "mutation"`).
- User: `infrastructure/token` reads the id from the JWT and calls `setUser({ id })` on setToken/getToken (login, signup, refresh, restore) and `setUser(null)` on clearToken (logout, expiry, account deletion).
- Owner: `Home/hooks/homeOwnerFilterStore.ts` sets the tags `owner_type` (`USER|FAMILY|ALL`) and `family_id` (family only).

## Tags

`error_code`, `owner_type`, `family_id`, plus `user.id`; API-side tags (`route`, `method`, `status_code`, `module`, `job`) are in the back doc. Search the same trace id in both projects to follow a web error to the API.

## Privacy rules (never add to an event)

No email, name, IP, cookies, `Authorization`, request/response bodies, form values or search text. Ids (user, family, account, transaction, card) are allowed. New context data goes through `scrub` (setContext and captureException already do). Add a key to `FORBIDDEN_KEYS` in `scrub.ts` (and the API's) when a new sensitive field appears.

## Checking it

Production only (`__DEV__` and `EXPO_PUBLIC_SENTRY_ENABLED !== "true"` disable it). After a deploy throw in a screen and check the issue shows the `.tsx` line, release and tags. Rollback: unset `EXPO_PUBLIC_SENTRY_ENABLED`.
