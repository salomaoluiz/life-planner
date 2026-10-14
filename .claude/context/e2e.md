# E2E (Maestro, web)

One suite guards both repos. The flows live **only** here (`e2e/`); the backend's `yarn e2e` forwards to this repo's runner. The suite runs against the current working trees of both repos, because the owner keeps `yarn web` (here) and `yarn start:dev` (`../life-planner-back`) running in watch mode on the Mac.

## Layout

```
e2e/
  config.yaml      workspace config
  flows/<module>/  one folder per module (auth, financial/accounts, financial/categories)
  subflows/        signup-via-api.yaml (fresh user; outputs EMAIL, PASSWORD, TOKEN, USER_ID), login.yaml (UI login with EMAIL/PASSWORD),
                   setup/create-<resource>.yaml (API setup), financial/open-accounts.yaml, financial/open-categories.yaml, financial/scroll-form-down.yaml
  scripts/         unique-user.js, api.js, random-name.js (output[KEY] = "<PREFIX> <4 digits>"), setup/create-<resource>.js
scripts/e2e/       run.mjs + cli.mjs (runner), summarize.mjs (report), unit tested
e2e-report/        generated, gitignored
```

## Running

- `yarn e2e --list-tags` (or `yarn e2e:tags`) lists every tag with its flow count; it only reads `e2e/flows`, so it needs no Maestro, API or app.
- `yarn e2e` whole suite, `yarn e2e --tags <tag>`, `yarn e2e:smoke`, `yarn e2e:failed` (only the flows in `e2e-report/failed.txt`).
- By default the Chromium window is visible; `--headless` hides it and combines with the other flags (`yarn e2e --headless --tags auth`). AI sessions use `--headless` so no window pops up on the owner's Mac.
- Needs Maestro and `E2E_ENABLED=true` in the gitignored `.env` (Mac only). The runner never starts, builds or stops the app or the API.
- Exit codes: 0 all passed, 1 a flow failed, 2 could not run (guard, Maestro, API or app missing, no report). Exit 2 means **not validated**.

## Reading the report

Open only `e2e-report/summary.md` (it is also what the command prints):

- Passed: one line `E2E PASSED: N/N flows (<duration>) · app <branch>@<sha> · api <branch>@<sha>`.
- Failed: a header and one block per failed flow (flow name and tags, flow file, step, error, screenshot, log), at most 15 blocks then `+N more failed flows`.
- `LIKELY ENVIRONMENT FAILURE` (more than half failed): check the app, the API and the login flow first; only 3 blocks are shown.
- Open only the files named in a failure block; never the log or artifacts of passing flows.

## Writing a flow

- Header: `url: ${E2E_WEB_URL}` and first step `- launchApp: { clearState: true }`, `name:` equal to the path under `flows/` without extension, `tags:` in list form (one module tag, `spec-NNN`, `smoke` on 1–2 flows per module, `wip` only while building).
- Create the user with `runFlow: ../../subflows/signup-via-api.yaml`; it exposes `${output.EMAIL}`, `${output.PASSWORD}`, `${output.TOKEN}`. Set up data through the API, drive only the behavior under test through the UI.
- Select by `id` only (testIDs), never by visible text. No fixed sleeps: `extendedWaitUntil`.
- One behavior per flow; each flow must pass alone and in any order.

## testIDs

Format `<module>.<screen>.<element>` in kebab-case, defined in the screen folder's `testIds.ts` (for example `Login/testIds.ts`) and used by the View, its Jest tests and the flows. `@components` that wrap RN elements forward `testID` (and derive `-error`, `-toggle`, `-frame` suffixes for `TextField`).

A wrapped component that takes an `accessibilityLabel` must also set `nativeID={testID}` (Maestro web resolves `id` before `data-testid`; `Touchable` and `TextField` already do).

Maestro facts verified on this Mac (flags, JUnit mapping, `id` matching on web) are recorded in `e2e/README.md`.

## Setup through the API (spec 018)

Data that is not under test is created through the API, never the UI. One self-contained GraalJS script per resource in `e2e/scripts/setup/` (no imports) reads `E2E_API_URL` (already ends in `/api`), `TOKEN` and its params from `env`, calls the endpoint with `Authorization: Bearer`, throws `E2E setup: <resource> failed with status <n>` on non-2xx and writes the id to `output` (`ACCOUNT_ID`, `CATEGORY_ID`, `TRANSACTION_ID`). A thin subflow in `e2e/subflows/setup/` passes the params and holds defaults in its header `env:`. Existing: `create-account`, `create-category`, `create-transaction`. USER-owned records use `OWNER_ID: ${output.USER_ID}`. Names typed or created by flows use `random-name.js`. When two setup calls output different ids, copy the first one right away (`- evalScript: ${output.KEEP_ACCOUNT_ID = output.ACCOUNT_ID}`) only if a later script reuses the same key.

Maestro web facts from spec 018: the form sheet does not scroll with `scrollUntilVisible` or a center swipe, use `subflows/financial/scroll-form-down.yaml` (swipes with explicit coordinates); elements outside the viewport are not found. `AmountInput` keeps the typed digits after the current ones, so `eraseText` before `inputText` (digits only: `123456` shows `$1,234.56`; assert with a locale-tolerant regex like `.*1[.,]234[.,]56.*`). An `id` is a regex, so `a|b` matches either. Derived ids: `<id>-error` (FieldShell), `<id>-icon-<value>` (IconChoiceGroup), `<id>-confirm` (ConfirmDialog), `<id>-close` (BottomSheet), `<id>-title` / `-balance` (ListItem rows). Components that take an `accessibilityLabel` must set `nativeID` (SegmentedControl and AmountInput were fixed in 018).

Categories (spec 019): `create-category` also nests a category when the caller passes `PARENT_ID` (a caller-scoped variable the script reads if defined; do not declare it in the subflow header or the runScript env, Maestro dropped it there). Keep the parent id under another key (`PARENT_CATEGORY_ID`). More derived ids: `<id>-EXPENSE` / `<id>-INCOME` (SegmentedControl appends the uppercase option value), `<id>-option-<value>` (SelectField, value = category id), `<id>-swatch-<hex>` (ColorSwatchGroup), `financial.category-form.name-preview` (typed name heading, use it to assert a saved name since Maestro web matches text, not input values). The list plus button does not pass the current type to the form, so flows pick the type in the form.
