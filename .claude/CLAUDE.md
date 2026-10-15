# Life Planner — Claude Context Router

Expo 52 / React Native 0.76 / TypeScript (strict) app for families: finances, stock (home storage), family members, configs.
Backend: Supabase is the **legacy** backend, being migrated to the new local NestJS API (`../life-planner-back`) — don't add new Supabase-only features without asking; see `.claude/context/backend.md`. Server state: React Query (wrapped). UI: Grafite component kit (`@components`) over React Native Paper. i18n: en-US + pt-BR.
Clean Architecture: `app/` (expo-router routes) → `src/presentation` → `src/application` → `src/domain` ← `src/data` (← `src/infrastructure`).

**Backend repo:** `../life-planner-back` (NestJS + Prisma API, sibling folder; router at `../life-planner-back/.claude/CLAUDE.md`; if that folder is missing, clone `git@github.com:salomaoluiz/life-planner-back.git` (https://github.com/salomaoluiz/life-planner-back) next to this repo or read it on GitHub). Read `.claude/context/backend.md` when a task involves the API contract or auth.

**This file is always loaded. Everything else is loaded on demand — read ONLY the files the task needs.**

## Context map (read on demand)

| When the task involves…                                                          | Read                                                                      |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Layer boundaries, DI chain, path aliases, where a file belongs                   | `.claude/context/architecture.md`                                         |
| Entities, enums, domain errors, repository interfaces, cache keys                | `.claude/context/domain.md`                                               |
| Supabase datasources, models (`fromJSON`/`toJSON`), repository impls, caching    | `.claude/context/data.md`                                                 |
| Use cases, DTOs, registering use cases, `uniqueName`                             | `.claude/context/application.md`                                          |
| Screens, containers, modals: hook-based MVVM (View, `use*ViewModel`, `*UIModel`) | `.claude/context/presentation.md`                                         |
| Routes, tabs, drawer, modal routes (`app/`)                                      | `.claude/context/routing.md`                                              |
| Shared UI components (`@components`) and their props                             | `.claude/context/components.md`                                           |
| Colors, sizes, spacing, `useStyles` pattern, dark mode                           | `.claude/context/theme.md`                                                |
| Any user-facing text                                                             | `.claude/context/i18n.md`                                                 |
| Writing/updating tests and `mocks/` files                                        | `.claude/context/testing.md`                                              |
| New table/column, RLS policies, triggers                                         | `.claude/context/database.md`                                             |
| Lint rules, import order, naming, commit flow                                    | `.claude/context/conventions.md`                                          |
| What already exists in a module (file inventory per layer)                       | `docs/ai/modules/<auth\|family\|familyMember\|financial\|home\|stock>.md` |
| Backend API (`../life-planner-back`): endpoints, auth, contract, Supabase → API  | `.claude/context/backend.md`                                              |
| E2E flows, testIDs, running the suite                                            | `.claude/context/e2e.md`                                                  |
| Building a whole new feature / CRUD slice end-to-end                             | skill `new-feature-slice` (`.claude/skills/new-feature-slice/`)           |

Tip: for a single-layer change read just that layer file + `conventions.md`. Do not open the module inventory unless you need to locate existing files.
Reference implementation for any new CRUD work: **financial accounts** (smallest complete, modern slice).

## Golden rules (non-negotiable)

1. **Domain is pure TS** — no React/RN/Expo/npm imports in `src/domain`.
2. **Dependency direction** — presentation → application → domain; data implements domain interfaces; only `src/infrastructure` may import wrapped libs (supabase, react-query, sentry, async-storage, expo-secure-store; HTTP goes through `@infrastructure/api`). `react-i18next` only inside `src/presentation/i18n/react-i18n`.
3. **Business rules live in use cases** (`src/application/useCases/cases/**`). Components are dumb; screens orchestrate through `useCases.*` + `@infrastructure/fetcher`.
4. **Errors**: never swallow. Datasources wrap unknown errors in `GenericError` + `addContext`, re-throw `BusinessError`s; use cases `addContext({ useCase })` and re-throw.
5. **No `any`, `@ts-ignore`, or lint-disable** to bypass rules (existing DI `@ts-expect-error` and `as any` on `router.push` paths are the known exceptions).
6. **All UI text through i18n** — add keys to BOTH `en-US` and `pt-BR`.
7. **Reuse `@components`**; never use a 3rd-party UI component directly in a screen — wrap it in `src/presentation/components` first.
8. **Keep docs in sync** — after changing code, update the matching `docs/ai/modules/<module>.md` (and these `.claude/context` files if a pattern changes). Don't commit plan files.
9. **Don't run lint/tests/prettier during implementation.** At the end, commit; Husky pre-commit runs `lint-staged`, `type-check` and related tests — fix whatever it reports.
10. **Never commit secrets or personal data.** This covers API keys, tokens, passwords, Supabase keys and URLs, Sentry DSNs and auth tokens, OAuth client IDs, signing keys/certificates (`.jks .p8 .p12 .key .pem .mobileprovision`) and real personal information (names, emails, phone numbers, addresses, documents, real user/family IDs or financial data).
    - Config goes in `.env` (gitignored) and is read via `process.env.EXPO_PUBLIC_*`; never hard-code values in source, tests, docs, SQL or mocks.
    - Only `.env.example` / `.env.test` are tracked, and they hold **placeholders only** (`your-...`). New variables are added there as placeholders.
    - Tests and mocks use fake data (`"user-id"`, random UUIDs, `test@example.com`).
    - Before every commit run `git diff --cached` and check it; stage files explicitly (no `git add -A` / `git add .`). If anything looks secret or personal, unstage it, don't commit, and tell the user. If a secret was already committed, stop and tell the user (the key must be rotated); don't try to rewrite history yourself.
11. **Always branch from the latest `main`, to keep history linear.** Before creating any new branch run `git fetch origin main` and create it from `origin/main` (`git checkout -b <branch> origin/main`) — never from a stale local `main` or from another feature branch. Before opening a PR, rebase onto the latest `origin/main` (`git fetch origin main && git rebase origin/main`) rather than merging `main` into the branch; no merge commits on feature branches.
12. **E2E guardrail (Maestro).**
    - Every feature or fix that changes user-visible behavior ships with at least one flow in `e2e/flows/<module>/`, tagged with its module and `spec-NNN`. It covers the happy path and the main error or empty state from the spec's acceptance criteria. New interactive elements get testIDs (`<module>.<screen>.<element>`) from the module's `testIds.ts`.
    - While building, tag the new flow `wip` and run it alone (`yarn e2e --tags wip`). Remove `wip` before committing; a committed `wip` tag is a bug.
    - Before reporting a task as done, run `yarn e2e` (the full suite) and read **only** `e2e-report/summary.md`. Do not open `junit.xml`, `maestro.log` or artifacts of passing flows. For each failure, open only the files named in its block.
    - Fix loop: fix, run `yarn e2e:failed`, and repeat until it passes. Then run `yarn e2e` once more in full.
    - Never delete, skip, `wip`-tag or weaken an existing flow (for example removing an assertion or changing it to a text match) to make the suite pass. If an existing flow is wrong because the spec changed the behavior, update it in the same commit and give the spec number in the commit message.
    - Maestro is already on the owner's zsh `PATH` (and `JAVA_HOME`), but the non-interactive shell of an AI session does not load it, so `yarn e2e` exits 2 with "maestro is not installed". Run it through zsh: `zsh -ic 'yarn e2e --headless'` (same for `yarn e2e:failed`). Never install or reconfigure Maestro for this.
    - E2E runs only on the owner's Mac. In a cloud session, ask for a session on the Mac to run it; never set up Maestro, browsers or servers in the cloud. The owner keeps the app and the API running; do not start or restart them yourself.
    - If `yarn e2e` exits with code 2 (could not run), say so in the final report with its one-line reason. Do not claim the feature was validated.
    - Report the final summary line (`E2E PASSED: N/N` or the failures) in the PR description.
13. **Spec status guardrail.** Every spec in `docs/superpowers/specs/` has a `- **Status:**` line with exactly one of: `Proposed` → `Planned` → `Implemented` → `PR open (#NN)` → `Done` (or `Rejected` / `Superseded by NNN`). Update it in the same turn as the event (plan saved, last task green on the full suite, PR created, PR seen merged) and say so in your message. Before writing a plan or starting implementation for spec N, reconcile every existing spec numbered below N: `PR open (#NN)` → `gh pr view NN --json state,mergedAt` (merged → `Done`; closed unmerged → tell the owner and stop; open → blocked); `Implemented`/`Planned`/`Proposed` → blocked unless verifiably merged in `origin/main` (then set `Done` and say how you verified). If anything is blocked, list the blockers with their status and stop; continue only if the owner explicitly says so, and record `Started with open specs: NNN, NNN (owner approved YYYY-MM-DD)` under the spec's status. Details and the status table: `docs/superpowers/specs/README.md`.
14. **Destructive-action guardrail.** If a task, spec or plan would require a destructive action outside the scope of the spec being implemented, stop and ask the owner before doing it, and wait for the answer. This covers deleting data of a real (non-test) user, force-pushing, rewriting history, resetting or discarding someone's uncommitted or unpushed work (including unpushed local commits and branches you did not create), and deleting branches, files or databases the task did not create. It applies to every feature and plan, in both repos, and a plan or an owner's earlier approval for one action does not extend to another.
