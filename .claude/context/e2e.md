# E2E (Maestro, web)

One suite guards both repos. The flows live **only** here (`e2e/`); the backend's `yarn e2e` forwards to this repo's runner. The suite runs against the current working trees of both repos, because the owner keeps `yarn web` (here) and `yarn start:dev` (`../life-planner-back`) running in watch mode on the Mac.

## Layout

```
e2e/
  config.yaml      workspace config
  flows/<module>/  one folder per module (auth today)
  subflows/        signup-via-api.yaml (fresh user through the API), login.yaml (UI login with EMAIL/PASSWORD)
  scripts/         unique-user.js, api.js (Maestro GraalJS helpers)
scripts/e2e/       run.mjs + cli.mjs (runner), summarize.mjs (report), unit tested
e2e-report/        generated, gitignored
```

## Running

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
