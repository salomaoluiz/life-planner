---
name: new-feature-slice
description: Use when adding a new entity/CRUD feature or a new module to Life Planner that spans domain, data, application and presentation layers (e.g. "add budgets", "create goals screen", "add a new financial entity"). Gives the ordered file checklist and which .claude/context files to read per step.
---

# New feature slice (end-to-end checklist)

Reference implementation to mirror: **financial accounts** (`docs/ai/modules/financial.md` lists every file).
Read each context file only when you reach its step. Write fields/keys alphabetically (lint).

Placeholders: `<module>` (e.g. `financial`), `<sub>` (e.g. `accounts`, optional), `X` (PascalCase entity), `x` (camelCase).

## 0. Plan

- Confirm fields, owner model (USER/FAMILY?), and which operations (get/create/update/delete/refresh).
- Skim `docs/ai/modules/<module>.md` if the module exists.

## 1. Database → `.claude/context/database.md`

- [ ] Table in `docs/database/1. create_tables.md`; RLS in `2. create_polices.md`; owner trigger in `7. validate_owner_trigger.md`.

## 2. Domain → `.claude/context/domain.md`

- [ ] `src/domain/entities/<module>/XEntity.ts` (+ enums)
- [ ] `src/domain/repositories/<module>/<module>XRepository.ts` + export in `index.ts`
- [ ] Add to `Repositories` in `src/domain/repositories/index.ts`
- [ ] `CacheStringKeys.CACHE_<MODULE>_X_DATA` in `src/domain/entities/cache/keys.ts`
- [ ] Business errors if needed (`entities/errors/<area>/`)

## 3. Data → `.claude/context/data.md`

- [ ] `src/data/models/<module>/XModel.ts` (`fromJSON`/`toJSON`)
- [ ] `src/data/repositories/repos/<module>/<sub>/xDatasource.ts` (interface)
- [ ] `src/data/datasource/data/<module>/<sub>/supabase/<method>.ts` ×N + `supabase/index.ts` + `<sub>/index.ts` factory + module `index.ts` export (+ spread in `datasource/data/index.ts` for new module)
- [ ] `src/data/repositories/repos/<module>/<sub>/<method>.ts` ×N + `xRepositoryImpl.ts` + module `index.ts` (+ spread in `repos/index.ts` for new module)
- [ ] Mock registries: `datasource/mocks/listDatasources.mocks.ts`, `repositories/mocks/listRepositories.mocks.ts`

## 4. Application → `.claude/context/application.md`

- [ ] `src/application/dto/<module>/XDTO.ts`
- [ ] Use cases `src/application/useCases/cases/<module>/<sub>/{get,create,update,delete,refresh}XUseCase.ts`
- [ ] Barrel exports (+ aliasing in module index, + spread in `cases/index.ts` for new module)

## 5. Presentation → `.claude/context/presentation.md`, `components.md`, `theme.md`, `i18n.md`

- [ ] Screen, hook-based MVVM: `index.tsx` (View, render only), `hooks/use<Screen>ViewModel.ts` (fetching, logic, navigation), `models/<X>UIModel.ts` (DTO to display mapping), `styles.ts`
- [ ] `containers/ListItem/{index.tsx,styles.ts,hooks/useListItemViewModel.ts}` (edit/delete)
- [ ] `modals/NewXModal/{index.tsx,styles.ts,hooks/useNewXViewModel.ts,hooks/useForm.ts,models/NewXUIModel.ts}` + `modals/index.ts`
- [ ] Export screen in `screens/index.tsx`
- [ ] i18n keys in `en-US` AND `pt-BR`

## 6. Routing → `.claude/context/routing.md`

- [ ] Screen route file + Tabs/Drawer entry
- [ ] Modal route file + `Stack.Screen` in `app/(app)/(modals)/_layout.tsx`

## 7. Tests → `.claude/context/testing.md`

- [ ] `.test.ts` + `mocks/*.mocks.ts` for: model, DTO, datasource methods, repository methods + impl, use cases (happy + error paths), UI models, ViewModel hooks, useForm, Views (with the hook mocked).
- [ ] Add new keys to the registration tests (`cases/index.test.ts`, datasource/repository `index.test.ts`) — they assert the exact key set.

## 8. Docs & commit → `.claude/context/conventions.md`

- [ ] Update/create `docs/ai/modules/<module>.md` (and add module to `docs/ai/INDEX.md` if new)
- [ ] Commit (conventional message); fix Husky failures (lint, type-check, tests). Don't run them manually before.
