# E2E tests (Maestro, web)

End-to-end flows that drive the real app (`yarn web`) against the real API (`yarn start:dev` in `../life-planner-back`). They run **only on the owner's Mac** and act as a guardrail: every user-visible change ships with a flow, and the full suite runs before a task is reported as done. See `.claude/context/e2e.md` and `.claude/CLAUDE.md` rule 12.

## Running

Prerequisites: Maestro installed, `E2E_ENABLED=true` in the gitignored `.env`, the app and the API already running (the runner never starts them).

```bash
yarn e2e                # whole suite
yarn e2e --tags auth    # one module (or any tag)
yarn e2e:smoke          # fast critical-path subset
yarn e2e:failed         # only the flows that failed in the previous run
```

The terminal shows only `e2e-report/summary.md`. Exit code: 0 passed, 1 a flow failed, 2 could not run (nothing was validated). From the backend repo, `yarn e2e` runs the same suite.

## Layout

```
e2e/
  config.yaml      # workspace config
  flows/           # only files here are run as tests, one folder per module
  subflows/        # reusable steps, never run alone
  scripts/         # Maestro runScript helpers (GraalJS)
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
