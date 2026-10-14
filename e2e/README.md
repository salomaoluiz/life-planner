# E2E tests (Maestro, web)

End-to-end flows that drive the real app (`yarn web`) against the real API (`yarn start:dev` in `../life-planner-back`). They run **only on the owner's Mac** and act as a guardrail: every user-visible change ships with a flow, and the full suite runs before a task is reported as done. See `.claude/context/e2e.md` and `.claude/CLAUDE.md` rule 12.

## Running

Prerequisites: Maestro installed, `E2E_ENABLED=true` in the gitignored `.env`, the app and the API already running (the runner never starts them).

```bash
yarn e2e                # whole suite
yarn e2e --tags auth    # one module (or any tag)
yarn e2e --headless     # no browser window (default: the Chromium window is visible)
yarn e2e:smoke          # fast critical-path subset
yarn e2e:failed         # only the flows that failed in the previous run
```

The terminal shows only `e2e-report/summary.md`. Exit code: 0 passed, 1 a flow failed, 2 could not run (nothing was validated). From the backend repo, `yarn e2e` runs the same suite.

## Layout

```
e2e/
  config.yaml      # workspace config
  flows/           # only files here are run as tests, one folder per module
  subflows/        # reusable steps, never run alone (setup/ = API setup, financial/ = navigation helpers)
  scripts/         # Maestro runScript helpers (GraalJS); setup/ = one script per API resource
scripts/e2e/       # runner (run.mjs, cli.mjs) and summarizer (summarize.mjs), unit tested
e2e-report/        # generated, gitignored
```

## Conventions

- One behavior per flow. File name is the behavior in kebab-case; the `name:` header equals the path under `flows/` without the extension (`auth/login`).
- Tags go in list form (the summarizer reads them): exactly one module tag (`auth`, `family`, `stock`, `financial`, `home`, `settings`), a `spec-NNN` tag, and `smoke` on 1–2 critical flows per module. Use `wip` while building a flow and never commit it (`yarn e2e --tags wip`).
- Select elements by `id` (testID) only, never by visible text (i18n) or coordinates. testID format `<module>.<screen>.<element>`, exported from the screen's `testIds.ts` and used by the View, its Jest tests and the flows. Text assertions only for data the flow typed itself.
- Every flow is independent: it creates its own user (`e2e+<timestamp>-<random>@example.com`) through the API (`subflows/signup-via-api.yaml`). Setup goes through the API, only the behavior under test through the UI.
- No fixed sleeps: use `extendedWaitUntil` / `assertVisible`. A flaky flow is fixed, not retried.
- Fake data only; never print the JWT.

## Maestro facts (verified 2026-10-14, Maestro 2.11.0, web/Chromium)

| Topic                   | Fact                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Install / Java          | `curl -fsSL "https://get.maestro.mobile.dev" \| bash`; needs a valid `JAVA_HOME` (for example `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`) and `~/.maestro/bin` on `PATH`. A wrong `JAVA_HOME` makes Maestro exit before any report: the runner then prints `maestro produced no report`, and `e2e-report/maestro.log` has the Java message.                                                  |
| Command                 | `maestro test e2e/flows --config e2e/config.yaml --platform web --headless --format junit --output e2e-report/junit.xml --test-output-dir e2e-report/artifacts -e KEY=value`. Tag filters: `--include-tags a,b`, `--exclude-tags wip`. Several flow files in one call also work; the runner runs one call per failed file for `--failed`.                                                            |
| Workspace config        | `e2e/config.yaml` with `flows: ["**"]` (the glob is relative to the target directory; `flows/**` matches nothing). Subflows are not run as tests.                                                                                                                                                                                                                                                    |
| Flow header             | `url: ${E2E_WEB_URL}` works (env is expanded). The header alone does **not** open the page: the first step must be `- launchApp: { clearState: true }`. `clearState` is required so a flow never starts logged in from the previous flow.                                                                                                                                                            |
| Subflow header          | A subflow file needs a config section too: `url: ${E2E_WEB_URL}` then `---`.                                                                                                                                                                                                                                                                                                                         |
| Selecting by `id`       | Maestro web resolves `resource-id` as `id` attribute, then `aria-label`, `name`, `title`, `for`, and only last `data-testid`. React Native Web renders `testID` as `data-testid` and `nativeID` as `id`, so an element with an `accessibilityLabel` hides its testID. `Touchable` and `TextField` therefore also set `nativeID={testID}`. New wrapped components that take a label must do the same. |
| Waiting                 | `launchApp` does not wait for the first render: start each subflow/flow with `extendedWaitUntil` on the first element it uses.                                                                                                                                                                                                                                                                       |
| Variables from subflows | `output.X` set by a script inside a `runFlow` subflow is visible to the parent flow (`${output.EMAIL}`).                                                                                                                                                                                                                                                                                             |
| JUnit                   | `<testcase name="auth/login" file="e2e/flows/auth/login.yaml" status="SUCCESS\|ERROR">`; tags are in `<properties>`; the failure text is only the error (`Element not found: Id matching regex: ...`), no step.                                                                                                                                                                                      |
| Artifacts               | `e2e-report/artifacts/<timestamp>/<flow with / as _>/{commands.json, screenshots/step-NNN-<command>-<selector>.png, screen-hierarchy/, logs/maestro.log}`. The failing step is the last screenshot's file name; the summarizer derives `step:` from it.                                                                                                                                              |
| Health                  | `GET /api/health` answers 200 online and 503 offline (it pings an external host); the runner treats any HTTP answer as "API up".                                                                                                                                                                                                                                                                     |

- Subflow headers accept default params (`env:` with defaults; callers override them). `output.X` survives several scripts. `id` is a regex. The form sheet needs explicit-coordinate swipes to scroll (`subflows/financial/scroll-form-down.yaml`). See `.claude/context/e2e.md` for the API setup pattern.
