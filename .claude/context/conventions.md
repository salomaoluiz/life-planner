# Conventions, lint & workflow

## Naming (actual repo practice)

| Kind                                       | Naming                                          | Example                                                                             |
| ------------------------------------------ | ----------------------------------------------- | ----------------------------------------------------------------------------------- |
| Entity / Model / DTO / UIModel class files | PascalCase                                      | `AccountEntity.ts`, `AccountModel.ts`, `AccountDTO.ts`, `AccountUIModel.ts`         |
| Use cases                                  | camelCase + `UseCase`                           | `createAccountUseCase.ts`                                                           |
| Repository interface / impl / datasource   | camelCase                                       | `financialAccountRepository.ts`, `accountRepositoryImpl.ts`, `accountDatasource.ts` |
| Per-method files                           | camelCase verb                                  | `getAccounts.ts`                                                                    |
| Components / screens                       | PascalCase folder + `index.tsx` (+ `styles.ts`) | `NewAccountModal/index.tsx`                                                         |
| ViewModel hooks                            | `hooks/use<Name>ViewModel.ts`                   | `useAccountsViewModel.ts`, `useNewAccountViewModel.ts`                              |
| Other hooks                                | `hooks/useX.ts`                                 | `useForm.ts`                                                                        |
| Route files                                | snake_case                                      | `add_new_account.tsx`                                                               |
| Tests / mocks                              | `X.test.ts(x)` / `mocks/X.mocks.ts(x)`          |                                                                                     |

Module folder names: `financial/accounts`, `stock`, `family`, `familyMember`, `user`, `auth`, `configs`, `home`.

## ESLint rules that bite

- **perfectionist (recommended-natural)**: object keys, interface members, class members, union types, named imports/exports, JSX props are **sorted alphabetically**. Write them sorted.
- **Import groups** (blank line between): 1) builtin/external 2) `@tests` 3) internal aliases (`@assets @screens @components @presentation @domain @application @infrastructure @data @navigation @utils @providers`) 4) relative. Alphabetical inside each group.
- `func-style: declaration` (use `function x() {}`, not arrow consts, for top-level functions/components).
- `no-console`, `no-nested-ternary`, `no-plusplus`, `no-duplicate-imports`, `@typescript-eslint/prefer-nullish-coalescing` (`??` not `||`), `promise-function-async`, `no-deprecated`.
- `import-x/no-cycle` (maxDepth 3).
- `no-restricted-imports`: no `../../`; external libs only via wrappers: `@infrastructure/supabase`, `@infrastructure/fetcher`, `@infrastructure/monitoring`, `@infrastructure/storage`, `@infrastructure/googleOAuth`, `@presentation/i18n`.
- Prettier formatting (double quotes, trailing commas).
- Default exports for single-unit files; barrels re-export with `export { default as X } from "./X"`.

## Workflow

- Commands: `yarn start | ios | android | web`, `yarn test`, `yarn type-check`, `yarn lint(:fix)`, `yarn format`. Yarn 4 via Corepack.
- **Don't run lint/tests/prettier while implementing.** Commit at the end; Husky:
  - `pre-commit`: `yarn lint-staged` (lint + prettier), `yarn type-check`, `yarn test` on staged files.
  - `pre-push`: `yarn lint`, `yarn test --coverage` (90% threshold).
    Fix what the hooks report, then re-commit.
- **Secrets/personal data check before every commit** (golden rule 10 in `.claude/CLAUDE.md`): stage files by name, review `git diff --cached` for keys, tokens, DSNs, URLs with credentials, and real personal or financial data. Gitignored and never staged: `.env`, `.env*.local`, `*.jks *.p8 *.p12 *.key *.pem *.mobileprovision`.
- Conventional commits (`feat:`, `fix:`, `style:`, `test:`, `docs:`, scope optional based on the module that was worked e.g. `feat(financial): ...`).
- After code changes update `docs/ai/modules/<module>.md`; don't commit plan files (`docs/superpowers/plans` are working notes).
