# Life Planner — Claude Context Router

Expo 52 / React Native 0.76 / TypeScript (strict) app for families: finances, stock (home storage), family members, configs.
Backend: Supabase is the **legacy** backend, being migrated to the new local NestJS API (`../life-planner-back`) — don't add new Supabase-only features without asking; see `.claude/context/backend.md`. Server state: React Query (wrapped). UI: React Native Paper + glass (expo-blur) components. i18n: en-US + pt-BR.
Clean Architecture: `app/` (expo-router routes) → `src/presentation` → `src/application` → `src/domain` ← `src/data` (← `src/infrastructure`).

**Backend repo:** `../life-planner-back` (NestJS + Prisma API, sibling folder; router at `../life-planner-back/.claude/CLAUDE.md`; if that folder is missing, clone `git@github.com:salomaoluiz/life-planner-back.git` (https://github.com/salomaoluiz/life-planner-back) next to this repo or read it on GitHub). Read `.claude/context/backend.md` when a task involves the API contract or auth.

**This file is always loaded. Everything else is loaded on demand — read ONLY the files the task needs.**

## Context map (read on demand)

| When the task involves…                                                          | Read                                                                |
| -------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| Layer boundaries, DI chain, path aliases, where a file belongs                   | `.claude/context/architecture.md`                                   |
| Entities, enums, domain errors, repository interfaces, cache keys                | `.claude/context/domain.md`                                         |
| Supabase datasources, models (`fromJSON`/`toJSON`), repository impls, caching    | `.claude/context/data.md`                                           |
| Use cases, DTOs, registering use cases, `uniqueName`                             | `.claude/context/application.md`                                    |
| Screens, containers, modals: hook-based MVVM (View, `use*ViewModel`, `*UIModel`) | `.claude/context/presentation.md`                                   |
| Routes, tabs, drawer, modal routes (`app/`)                                      | `.claude/context/routing.md`                                        |
| Shared UI components (`@components`) and their props                             | `.claude/context/components.md`                                     |
| Colors, sizes, spacing, `useStyles` pattern, dark mode                           | `.claude/context/theme.md`                                          |
| Any user-facing text                                                             | `.claude/context/i18n.md`                                           |
| Writing/updating tests and `mocks/` files                                        | `.claude/context/testing.md`                                        |
| New table/column, RLS policies, triggers                                         | `.claude/context/database.md`                                       |
| Lint rules, import order, naming, commit flow                                    | `.claude/context/conventions.md`                                    |
| What already exists in a module (file inventory per layer)                       | `docs/ai/modules/<auth\|family\|familyMember\|financial\|stock>.md` |
| Backend API (`../life-planner-back`): endpoints, auth, contract, Supabase → API  | `.claude/context/backend.md`                                        |
| Building a whole new feature / CRUD slice end-to-end                             | skill `new-feature-slice` (`.claude/skills/new-feature-slice/`)     |

Tip: for a single-layer change read just that layer file + `conventions.md`. Do not open the module inventory unless you need to locate existing files.
Reference implementation for any new CRUD work: **financial accounts** (smallest complete, modern slice).

## Golden rules (non-negotiable)

1. **Domain is pure TS** — no React/RN/Expo/npm imports in `src/domain`.
2. **Dependency direction** — presentation → application → domain; data implements domain interfaces; only `src/infrastructure` may import wrapped libs (supabase, react-query, sentry, async-storage, google-signin). `react-i18next` only inside `src/presentation/i18n/react-i18n`.
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
