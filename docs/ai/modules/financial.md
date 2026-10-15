# Financial Module Context

## Domain

```yaml
entities:
  AccountEntity:
    path: src/domain/entities/financial/AccountEntity.ts
    properties:
      - id
      - balance
      - icon
      - name
      - owner
      - ownerId
      - status
  CategoryEntity:
    path: src/domain/entities/financial/CategoryEntity.ts
    properties:
      - depthLevel
      - icon
      - iconColor
      - id
      - name
      - owner
      - ownerId
      - parentId
  TransactionEntity:
    path: src/domain/entities/financial/TransactionEntity.ts
    properties:
      - accountId
      - category
      - categoryId
      - date
      - description
      - id
      - owner
      - ownerId
      - type
      - value

interfaces:
  AccountRepository:
    path: src/domain/repositories/financial/financialAccountRepository.ts
    methods:
      - createAccount
      - deleteAccount
      - getAccounts
      - updateAccount
  CategoryRepository:
    path: src/domain/repositories/financial/financialCategoryRepository.ts
    methods:
      - createCategory
      - deleteCategory
      - getCategories
      - updateCategory
  TransactionRepository:
    path: src/domain/repositories/financial/financialTransactionRepository.ts
    methods:
      - createTransaction
      - deleteTransaction
      - getTransactions
      - updateTransaction
```

## Application

```yaml
use_cases:
  createAccountUseCase:
    path: src/application/useCases/cases/financial/accounts/createAccountUseCase.ts
    behavior: Creates a new financial account.

  deleteAccountUseCase:
    path: src/application/useCases/cases/financial/accounts/deleteAccountUseCase.ts
    behavior: Deletes a financial account by ID.

  getAccountsUseCase:
    path: src/application/useCases/cases/financial/accounts/getAccountsUseCase.ts
    behavior: Retrieves list of financial accounts.

  refreshAccountsUseCase:
    path: src/application/useCases/cases/financial/accounts/refreshAccountsUseCase.ts
    behavior: Invalidates the cache of financial accounts.

  updateAccountUseCase:
    path: src/application/useCases/cases/financial/accounts/updateAccountUseCase.ts
    behavior: Updates an existing financial account.

  createCategoryUseCase:
    path: src/application/useCases/cases/financial/categories/createCategoryUseCase.ts
    behavior: Creates a new financial category.

  deleteCategoryUseCase:
    path: src/application/useCases/cases/financial/categories/deleteCategoryUseCase.ts
    behavior: Deletes a category by ID.

  getCategoriesUseCase:
    path: src/application/useCases/cases/financial/categories/getCategoriesUseCase.ts
    behavior: Retrieves the financial categories.

  refreshCategoriesUseCase:
    path: src/application/useCases/cases/financial/categories/refreshCategoriesUseCase.ts
    behavior: Refreshes/invalidates category cache.

  updateCategoryUseCase:
    path: src/application/useCases/cases/financial/categories/updateCategoryUseCase.ts
    behavior: Updates an existing category; forwards name, icon, iconColor, type and parentId (null removes the parent); never owner/ownerId/depthLevel.

  getMostUsedFinancialCategoriesUseCase:
    path: src/application/useCases/cases/financial/categories/getMostUsedCategoriesUseCase.ts
    behavior: 5 most used categories of a type and owner in the last 90 days, fallback by name.

  createTransactionUseCase:
    path: src/application/useCases/cases/financial/transactions/createTransactionUseCase.ts
    behavior: Creates a new financial transaction.

  deleteTransactionUseCase:
    path: src/application/useCases/cases/financial/transactions/deleteTransactionUseCase.ts
    behavior: Deletes a transaction by ID.

  getTransactionsUseCase:
    path: src/application/useCases/cases/financial/transactions/getTransactionsUseCase.ts
    behavior: Retrieves the user's financial transactions.

  refreshTransactionsUseCase:
    path: src/application/useCases/cases/financial/transactions/refreshTransactionsUseCase.ts
    behavior: Refreshes/invalidates transaction cache or fetches latest.

  updateTransactionUseCase:
    path: src/application/useCases/cases/financial/transactions/updateTransactionUseCase.ts
    behavior: Updates an existing transaction.

dtos:
  - name: AccountDTO
    path: src/application/dto/financial/AccountDTO.ts
  - name: CategoryDTO
    path: src/application/dto/financial/CategoryDTO.ts
  - name: TransactionDTO
    path: src/application/dto/financial/TransactionDTO.ts
```

## Infrastructure

```yaml
repositories:
  accountRepositoryImpl:
    path: src/data/repositories/repos/financial/accounts/accountRepositoryImpl.ts
    implements: AccountRepository
  categoryRepositoryImpl:
    path: src/data/repositories/repos/financial/categories/categoryRepositoryImpl.ts
    implements: CategoryRepository
  transactionRepositoryImpl:
    path: src/data/repositories/repos/financial/transactions/transactionRepositoryImpl.ts
    implements: TransactionRepository

datasources:
  accountsDatasource (API):
    path: src/data/datasource/data/financial/accounts/api/
    uses: "@infrastructure/api (/v1/finance/accounts); AccountModel JSON = API shape (balance in cents <-> decimal number), also the repository cache shape"
    methods:
      - createAccount: src/data/datasource/data/financial/accounts/api/createAccount.ts
      - deleteAccount: src/data/datasource/data/financial/accounts/api/deleteAccount.ts
      - getAccounts: src/data/datasource/data/financial/accounts/api/getAccounts.ts
      - updateAccount: src/data/datasource/data/financial/accounts/api/updateAccount.ts
    helpers:
      - financialApiError: src/data/datasource/data/financial/financialApiError.ts # 400 -> FieldInvalid, 403 -> FinancialOwnerNotAllowed, 404 -> FinancialNotFound, 409 on delete -> AccountHasTransactions, other -> GenericError
      - ownerQuery: src/data/datasource/data/financial/ownerQuery.ts # ?ownerId=a&ownerId=b (empty ownerIds -> no request)
      - money: src/data/models/financial/money.ts # cents <-> decimal number / decimal string
  categoriesDatasource (API):
    path: src/data/datasource/data/financial/categories/api/
    uses: "@infrastructure/api (/v1/finance/categories); never sends depthLevel, owner or ownerId on update, drops depthLevel on create; CategoryModel JSON = API shape ('black' <-> #000000 via models/financial/iconColor.ts, parentId null <-> undefined)"
    methods:
      - createCategory: src/data/datasource/data/financial/categories/api/createCategory.ts
      - deleteCategory: src/data/datasource/data/financial/categories/api/deleteCategory.ts # 409 -> CategoryHasTransactions
      - getCategories: src/data/datasource/data/financial/categories/api/getCategories.ts
      - updateCategory: src/data/datasource/data/financial/categories/api/updateCategory.ts
  transactionsDatasource (API):
    path: src/data/datasource/data/financial/transactions/api/
    uses: "@infrastructure/api (/v1/finance/transactions); TransactionModel JSON = API shape (value cents <-> '234.90', date YYYY-MM-DD <-> local-midnight ISO via models/financial/calendarDate.ts, category name from the embedded category.name — the name is no longer stored or sent)"
    methods:
      - createTransaction: src/data/datasource/data/financial/transactions/api/createTransaction.ts
      - deleteTransaction: src/data/datasource/data/financial/transactions/api/deleteTransaction.ts
      - getTransactions: src/data/datasource/data/financial/transactions/api/getTransactions.ts
      - updateTransaction: src/data/datasource/data/financial/transactions/api/updateTransaction.ts
```

## Presentation

All paths below are under `src/presentation/screens/Financial/` unless noted. Financial passes the presentation lint guardrails (the `migrationAllowList` has no Financial entry).

```yaml
layout:
  Layout: Layout/index.tsx # FinancialLayout: Screen, header, section segments, 720 column; sections render plain Views
  files: [Layout/hooks/useFinancialLayoutViewModel.ts, Layout/models/financialSections.ts, Layout/styles.ts]

Transactions:
  view: Transactions/index.tsx (+ styles.ts) # header: month switcher, scope chips (owner), summary card, type SegmentedControl; then FlashList of day groups (spec 025)
  hooks: Transactions/hooks/useTransactionsViewModel.ts (+ index.ts, fetchTransactions, fetchSummary)
  cacheKeys: models/queryKeys.ts (listQueryKey: list screens cache a composed shape under [uniqueName, "list"]; forms cache the raw use-case output under [uniqueName])
  models: [Transactions/models/TransactionUIModel.ts, Transactions/models/transactionList.ts]
  components: Transactions/components/{MonthSwitcher,MonthSummary,MonthPickerSheet,TransactionRow}/index.tsx
  form: Transactions/modals/NewTransactionModal/
    - index.tsx, styles.ts
    - hooks/useNewTransactionViewModel.ts
    - models/{transactionFormState.ts,NewTransactionUIModel.ts}
    - components/{CategoryChips,CategoryPickerSheet,MissingRecordHint}/index.tsx

Categories:
  view: Categories/index.tsx (+ styles.ts) # type SegmentedControl, owner ChipGroup, FlashList of TreeItem rows
  hooks: Categories/hooks/useCategoriesViewModel.ts (+ index.ts, fetchCategories)
  models: Categories/models/CategoryRowUIModel.ts
  form: Categories/modals/NewCategoryModal/
    - index.tsx, styles.ts
    - hooks/useNewCategoryViewModel.ts
    - models/{categoryFormState.ts,NewCategoryUIModel.ts}
    - components/{CustomColorSheet,IconPickerSheet}/index.tsx

Accounts:
  view: Accounts/index.tsx (+ styles.ts) # total, owner chips, active list, collapsible archived section
  hooks: Accounts/hooks/useAccountsViewModel.ts (+ index.ts, fetchAccounts)
  models: [Accounts/models/AccountUIModel.ts, Accounts/models/accountList.ts]
  form: Accounts/modals/NewAccountModal/
    - index.tsx, styles.ts
    - hooks/useNewAccountViewModel.ts
    - models/{accountFormState.ts,NewAccountUIModel.ts}

shared:
  - models/ownerOptions.ts # ALL_OWNERS, buildOwnerChoices, buildOwnerFilterChoices, personalOwnerId, translateChoices
  - models/categoryTree.ts # buildCategoryRows, descendantIds, categoriesOf, filterRowsByQuery
  - utils/financialErrorMessage.ts # getFinancialErrorMessageKey (006 error -> i18n key)
  - src/presentation/constants/categoryColors.ts # 12-color palette (stored data, excluded from the color lint rule), isHexColor, normalizeCategoryColor
  - src/presentation/constants/categoryIcons.ts # 18 icons (12 common), filterIcons, iconLabel
  - src/presentation/constants/accountIcons.ts
  - "@utils/money (cents <-> decimal helpers)"
  - "kit: GroupHeader, TreeItem, ColorSwatchGroup, IconChoiceGroup, SegmentedControl, ChipGroup, BottomSheet, ConfirmDialog, AmountInput/AmountText"

add_transaction: quick-add tab button (`/quick_add`).
navigation_files: `screens/Navigation/*` (AppTabBar, navigationItems), `screens/QuickAdd`, `screens/Financial/Layout`, `screens/Home/containers/ProfileButton`.
```

## Presentation notes

- Forms are `BottomSheet`s (centered dialogs on wide web); create has no params, edit uses route param `id`. Delete always goes through `ConfirmDialog`. Save and delete errors are form-level copy through `getFinancialErrorMessageKey` (006 keys); the old `useFinancialErrorFeedback` hook and `/business_feedback` route are no longer used by Finances. Closing a dirty form asks to discard (`common.form.discardMessage`). `isSaving`/`isDeleting` come from `useMutation().isFetching`.
- Owner is immutable in edit for accounts and categories (the API answers 400 when PATCH carries `owner`/`ownerId`); the "Belongs to" chips are locked in edit and also when `ownerId` arrives as a route param on create (pushed by the transaction form's inline create). Transactions may change owner (the form clears the stale account/category).
- Money: `@utils/money`. The transaction value (decimal string from the API) and the account balance (decimal number) are converted to cents in the form state modules (`transactionFormState`, `accountFormState`); the UI works in cents (`AmountInput`/`AmountText`). The account balance has a Positive/Negative sign control and is not updated by transactions.
- Transactions: month filtering and day grouping are client-side (`transactionList`); the month summary comes from `getMonthSummaryUseCase` (spec 010) for the selected month and owner (it uses only the scope/owner filter and ignores the type filter; `ownerFilter` + `typeFilter` state, `filterByOwner`/`filterByType` in `transactionList`; a scope that is no longer an owner falls back to All). Most-used rule: the category chips show the 5 most used categories of the type and owner (`getMostUsedFinancialCategoriesUseCase`) plus a "More" tree picker with search; changing type or owner clears the category and swaps the account; a missing account or category is created inline (the new record is selected when the stacked sheet returns).
- Categories: tree rows via `categoryTree`; palette (`categoryColors`) plus a custom `#RRGGBB` sheet ("Custom" shows as selected for a stored color outside the palette, never rewritten unless the user picks another); 12 inline icons plus a searchable sheet of 18. PATCH sends only changed fields among name, icon, iconColor, type, parentId (`null` removes the parent). Type is locked in edit when it has a parent, subcategories or transactions; changing type or owner clears the parent. Delete warns with `financial.categories.deleteConfirm.withSubcategories` for parents and shows `financial.categories.errors.hasTransactions` on 409. The form state field is `iconColor` because the guardrail forbids a `color` property key in screens.
- Accounts: total (`accounts-total`), owner chips, active list and a collapsible archived section; delete with transactions shows `financial.accounts.errors.hasTransactions` in the sheet.
- Error mapping (all three resources, `financialApiError.ts`): 400 -> `FieldInvalid`, 403 -> `FinancialOwnerNotAllowed`, 404 -> `FinancialNotFound`, 409 on account/category delete -> `AccountHasTransactions` / `CategoryHasTransactions`, other -> `GenericError`. Contexts hold ids only.

## E2E flows (spec 018)

testIDs: `Financial/Layout/testIds.ts`, `Financial/Accounts/testIds.ts`, `Financial/Accounts/modals/NewAccountModal/testIds.ts`. Flows in `e2e/flows/financial/accounts/` (tags `financial` + spec):

- `create-account` (spec-006, spec-013, smoke), `create-account-validation` (spec-013)
- `edit-account` (spec-006, spec-013), `archive-account` (spec-013, spec-023, includes the un-archive round trip), `delete-account` (spec-006, spec-013)
- `delete-account-with-transactions` (spec-006)

## E2E flows: categories (spec 019)

testIDs: `Financial/Categories/testIds.ts` (`financial.categories.*`; a root row is `row`, a subcategory row `child-row`) and `Financial/Categories/modals/NewCategoryModal/testIds.ts` (`financial.category-form.*`). Flows in `e2e/flows/financial/categories/` (tags `financial` + spec):

- `create-expense-category` (spec-006, spec-013, smoke), `create-income-category` (spec-013), `create-category-validation` (spec-013)
- `create-subcategory` (spec-006, spec-013), `edit-category` (spec-006, spec-013)
- `delete-category-with-subtree` (spec-006), `delete-category-with-transactions` (spec-006; the transaction is on the child, the root delete is refused)

## E2E flows: transactions (spec 020)

testIDs: `Financial/Transactions/testIds.ts` (`financial.transactions.*`; the row id is shared, use `row-title` plus the typed description to pick one; `empty-month` with its `-action`, `month-previous`, `month-next`, `month-summary`, `summary-expense`, `summary-income`, `summary-scope`, `scope-filter-<ownerId|ALL>`, `type-filter-ALL|EXPENSE|INCOME`, `filtered-empty` with its `-action`) and `Financial/Transactions/modals/NewTransactionModal/testIds.ts` (`financial.transaction-form.*`; category chips are `category-<categoryId>`, the account select options `account-select-option-<accountId>`). The list has no add button: the entry points are `empty-month-action` and the global Quick add. Flows in `e2e/flows/financial/transactions/` (tags `financial` + spec):

- `create-expense` (spec-006, spec-013, smoke), `create-income` (spec-013, asserts no EXPENSE chip), `create-from-quick-add` (spec-009, spec-013)
- `create-missing-records` (spec-013), `create-validation` (spec-013, includes a whitespace-only description)
- `edit-transaction` (spec-006, spec-013), `delete-transaction` (spec-006, spec-013)
- `month-navigation` (spec-013; the transaction is dated the 10th of last month), `home-latest-transactions` (spec-010, secondary tag `home`)

## E2E flows: family-owned records (spec 022)

Owner pickers are chip groups: `financial.account-form.owner`, `financial.category-form.owner`, `financial.transaction-form.owner` (chip = `<id>-<ownerId>`; the personal chip is the user id). Owner filters: `financial.accounts.owner-filter`, `financial.categories.owner-filter`, `financial.transactions.scope-filter` (chips `-<ownerId>` or `-ALL`; the type is `financial.transactions.type-filter-ALL|EXPENSE|INCOME`). Flows in `e2e/flows/family/`: `family-account`, `family-category`, `family-transaction`, `member-sees-family-data`.
