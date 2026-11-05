# Performance guardrail (frontend)

Rule: `.claude/CLAUDE.md` rule 18. Specs: 067 (request budgets and screen coverage), 068 (rules). The backend counterpart is `../life-planner-back/.claude/context/performance.md`.

## Commands

- `yarn perf --changed`: modules touched by the diff (against `origin/main`, plus uncommitted and untracked files). Shared paths (`src/infrastructure/`, `src/application/providers/`, `src/presentation/components/`, `app/_layout.tsx`, `package.json`, `yarn.lock`) select every module.
- `yarn perf --all`, `yarn perf --module <name>[,<name>]`, `--dry-run` (shows the selection only; `PERF SKIPPED: no module selected` when nothing matches).
- `yarn perf --module <m> --update-baseline`: writes the measured numbers into the budgets (the ratchet, see below).
- Exit codes: `0` passed, `1` a budget failed, `2` could not run (bad arguments or jest produced no report). On `2`, report its one-line reason and never claim the change was checked.

## Reading the result

Read only `perf-report/summary.md` (git-ignored). It ends with `PERF PASSED: N/N` or `PERF FAILED: N/N` and lists each failure. Open other files in `perf-report/` only for a failure named there.

## Registry

`perf/budgets/<module>.json`, one entry per screen or modal, key `<module>.<screen>.<scenario>` (for example `home.home.mount.cold`):

| Field              | Meaning                                                           |
| ------------------ | ----------------------------------------------------------------- |
| `route` or `modal` | the `app/` route file or the modal name the scenario mounts       |
| `maxRequests`      | max HTTP requests during the scenario                             |
| `maxDuplicates`    | max identical requests repeated                                   |
| `maxDepth`         | max depth of request waterfalls                                   |
| `knownException`   | a budget above the default limit, naming the spec that removes it |

Each screen or modal has a `__perf__/<screen>.perf.test.tsx` next to it. A screen or modal without an entry and a perf test fails the coverage tests (`scripts/perf/coverage.test.ts`): add both in the same PR, then `yarn perf --module <m> --update-baseline`.

## Ratchet and exceptions

- `--update-baseline` only lowers a budget silently. Raising one needs a reason in the PR description and the owner's review.
- A `knownException` always names the spec that removes it.
- No `GET` of a money list without `from`/`to`; no `import * as` from `date-fns`; no namespace import of heavy modules outside lazy routes.

## PR block

Copy into the PR description (template: `.github/pull_request_template.md`): modules checked, the final summary line, and before/after of any changed budget.

## Render commits and benchmarks (spec 087)

- Registry field `maxCommits`: max React commits of a render scenario (`<module>.<screen>.render.mount`, and for transactions `render.create`, `render.expandInvoice`). A render scenario has no request fields; `--update-baseline` writes only `maxCommits` for it.
- Month prefetch: `financial.transactions.mount.idle` (requests of the idle prefetch, max 2) and `financial.transactions.monthSwitch.prefetched` (rows at once, no skeleton; 1 background revalidation request, because prefetched months are marked stale so a change made elsewhere is not hidden). The cold-open and switch budgets exclude the prefetch (it waits `PREFETCH_IDLE_MS`).
- `__perf__/transactionList.bench.test.ts`: the list derivation (filter, group by day, sort) at 5k and 20k rows must scale with a ratio below 6.

## Web bundle budget (spec 088)

- `yarn perf:bundle` (`scripts/perf/check-bundle-size.mjs`) runs `npx expo export -p web` into a temp dir (about 30 s), measures the entry chunk and the total JS (gzip and brotli) and compares with `perf/bundle-budget.json`. It appends a table (budget, measured, delta) to `perf-report/summary.md` and ends with `BUNDLE PASSED` or `BUNDLE FAILED: over budget`. Exit `0` passed, `1` over budget, `2` the export could not run.
- `yarn perf --changed` runs it too (after the module tests) when the diff touches `app/`, `metro.config.js`, `app.config.ts`, `package.json`, `yarn.lock`, or a `src/` file that imports date-fns, lodash, Sentry, react-native-paper or Supabase. `--dry-run` prints `Perf bundle: selected`.
- `node scripts/perf/check-bundle-size.mjs --update-budget` rewrites the budget as measured + 2%. Budgets only go down silently; raising one needs a reason in the PR and the owner's review.
- ESLint blocks `import * as` from `date-fns` and the `lodash` root import (`eslint/rules/no-restricted-imports.mjs`); Sentry is already restricted to `@infrastructure/monitoring`.

- Spec 089 lowered the budget: entry 1.16 MB to about 0.92 MB gzip through async routes on web, lazy modals, the Sentry replay/feedback shim and per-function date-fns imports (see `routing.md`, "Web code splitting").
