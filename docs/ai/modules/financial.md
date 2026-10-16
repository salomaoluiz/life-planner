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
      - projectedBalance # balance at the end of the current month (defaults to balance)
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
  CreditCardEntity:
    path: src/domain/entities/financial/CreditCardEntity.ts
    properties:
      - brand
      - closingDay
      - color
      - dueDay
      - id
      - lastDigits
      - limit # cents
      - owner
      - ownerId
      - paymentDay
      - status
      - title
  InvoiceEntity / CreditCardOverviewEntity:
    path: src/domain/entities/financial/{InvoiceEntity,CreditCardOverviewEntity}.ts
    notes: invoices are computed by the API (open + up to 3 closed per card), dates are YYYY-MM-DD strings, amounts in cents
  TransactionEntity:
    path: src/domain/entities/financial/TransactionEntity.ts
    properties:
      - accountId
      - category
      - categoryId
      - date
      - description
      - excludeFromTotals
      - id
      - owner
      - ownerId
      - systemKey # system category key; BALANCE_ADJUSTMENT = balance adjustment
      - type
      - value

interfaces:
  CreditCardRepository:
    path: src/domain/repositories/financial/financialCreditCardRepository.ts
    methods:
      - createCreditCard
      - deleteCreditCard
      - getCreditCards
      - getCreditCardsOverview
      - updateCreditCard
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
  adjustFinancialAccountBalanceUseCase:
    path: src/application/useCases/cases/financial/accounts/adjustAccountBalanceUseCase.ts
    behavior: Makes the CURRENT balance equal to a desired value; the API records the difference as a transaction.

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
    behavior: Updates an existing financial account (name, icon, status; no balance, spec 028).

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

  creditCards (spec 026):
    path: src/application/useCases/cases/financial/creditCards/
    useCases: createFinancialCreditCardUseCase, updateFinancialCreditCardUseCase (null clears paymentDay/lastDigits), deleteFinancialCreditCardUseCase, getFinancialCreditCardsUseCase, getFinancialCreditCardsOverviewUseCase
    dtos: src/application/dto/financial/{CreditCardDTO,CreditCardOverviewDTO}.ts

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
    uses: "@infrastructure/api (/v1/finance/accounts); AccountModel JSON = API shape (balance and projectedBalance in cents <-> decimal number), also the repository cache shape; create sends initialBalance; getAccounts sends ?today= (device local date via todayCalendarDate); 422 -> AccountArchived (adjust, and transaction create/update); transaction repositories also invalidate the accounts cache; TransactionModel JSON category = { excludeFromTotals, name, systemKey }"
    methods:
      - adjustAccountBalance: src/data/datasource/data/financial/accounts/api/adjustAccountBalance.ts # POST /v1/finance/accounts/:id/balance-adjustment?today=
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
  creditCardsDatasource (API):
    path: src/data/datasource/data/financial/creditCards/api/
    uses: "@infrastructure/api (/v1/finance/credit-cards, /overview); CreditCardModel/CreditCardOverviewModel keep money in cents (no cache layer: invoices are server-computed); delete 409 -> CreditCardHasTransactions; error context never holds the title or last digits"
    repository: src/data/repositories/repos/financial/creditCards/{creditCardRepositoryImpl,creditCardMapper}.ts
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

Cards (spec 026):
  view: Cards/index.tsx (+ styles.ts, testIds.ts) # aggregate Card (total limit, ProgressBar, used/available MetricBlocks), owner chips, CreditCardTile carousel, selected-card header with Edit, Open|Closed SegmentedControl, invoice rows, collapsible Archived list
  hooks: Cards/hooks/useCardsViewModel.ts (fetchCards: owners + overview + list)
  models: Cards/models/cardList.ts (aggregateOf follows the owner filter, buildCardEntries, formatDayMonth, formatReferenceMonth)
  components: Cards/components/InvoiceRow/
  form: Cards/modals/NewCreditCardModal/
    - index.tsx, styles.ts, testIds.ts
    - hooks/useNewCreditCardViewModel.ts
    - models/{cardFormState.ts,NewCreditCardUIModel.ts}
  constants: src/presentation/constants/cardColors.ts # 8 swatches, stored data (excluded from the color lint rule)
  kit: ProgressBar, CreditCardTile, ColorSwatchGroup (custom swatch optional)

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
- Money: `@utils/money`. The transaction value (decimal string from the API) and the account balance (decimal number) are converted to cents in the form state modules (`transactionFormState`, `accountFormState`); the UI works in cents (`AmountInput`/`AmountText`). The account amount is the INITIAL balance on create and the CURRENT balance on edit (a change records a balance adjustment: `saveAccountChanges` adjusts before archiving and patches before reactivating; an archived account that stays archived cannot change its balance). Rows show an 'End of month' line only when the projected balance differs; the toolbar totals current and end-of-month. Balance adjustments (`TransactionUIModel.isAdjustment`) show a translated label, the `scale-balance` icon and no category; tapping one opens `AdjustmentSheet` (delete only, with a confirm dialog) instead of the form; month summaries (`getMonthSummaryUseCase`) and Home's latest list skip `excludeFromTotals` transactions. The transaction form no longer lists archived accounts except the one already selected.
- Transactions: month filtering and day grouping are client-side (`transactionList`); the month summary comes from `getMonthSummaryUseCase` (spec 010) for the selected month and owner (it uses only the scope/owner filter and ignores the type filter; `ownerFilter` + `typeFilter` state, `filterByOwner`/`filterByType` in `transactionList`; a scope that is no longer an owner falls back to All). Most-used rule: the category chips show the 5 most used categories of the type and owner (`getMostUsedFinancialCategoriesUseCase`) plus a "More" tree picker with search; changing type or owner clears the category and swaps the account; a missing account or category is created inline (the new record is selected when the stacked sheet returns).
- Categories: tree rows via `categoryTree`; palette (`categoryColors`) plus a custom `#RRGGBB` sheet ("Custom" shows as selected for a stored color outside the palette, never rewritten unless the user picks another); 12 inline icons plus a searchable sheet of 18. PATCH sends only changed fields among name, icon, iconColor, type, parentId (`null` removes the parent). Type is locked in edit when it has a parent, subcategories or transactions; changing type or owner clears the parent. Delete warns with `financial.categories.deleteConfirm.withSubcategories` for parents and shows `financial.categories.errors.hasTransactions` on 409. The form state field is `iconColor` because the guardrail forbids a `color` property key in screens.
- Accounts: total (`accounts-total`), owner chips, active list and a collapsible archived section; delete with transactions shows `financial.accounts.errors.hasTransactions` in the sheet.
- Error mapping (all three resources, `financialApiError.ts`): 400 -> `FieldInvalid`, 403 -> `FinancialOwnerNotAllowed`, 404 -> `FinancialNotFound`, 409 on account/category delete -> `AccountHasTransactions` / `CategoryHasTransactions`, other -> `GenericError`. Contexts hold ids only.

- Credit cards (spec 026): the owner (Personal or a family) is chosen on the card and CAN change on edit (unlike accounts and categories); the form has no account link. Days use `SelectField` 1-31 (payment day has a leading "Same as due day" option that sends `null` on edit); a payment after the due date only shows a warning (`isPaymentAfterDue`). Archive/Reactivate and Delete live in the form (no overflow menu); an archived card opens the same form from the collapsed Archived list. The form state field is `tint` (screens cannot use a `color` key) and the testID key `swatches` (same reason). Invoice amounts are 0 until the next spec links transactions to cards; `used`/`available` come from the API per card and the aggregate is recomputed client-side for the active scope filter.

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

## E2E flows: credit cards (spec 026)

testIDs: `Financial/Cards/testIds.ts` (`financial.cards.*`: `screen`, `empty-state` with `-action`, `add-button`, `total-limit`, `tile` with `tile-title`, `edit-button`, `invoice-tabs`, `invoice-row`, `no-closed`, `archived-toggle`, `row` with `row-title`, `owner-filter`) and `Cards/modals/NewCreditCardModal/testIds.ts` (`financial.card-form.*`; select options are `<id>-option-<value>`, e.g. `closing-day-option-5`; swatches `swatches` / `color`). Flows (tags `financial`/`family` + `spec-026`): `financial/credit-cards` (create -> list + aggregate -> edit -> archive -> reactivate -> delete) and `family/family-credit-card` (a member sees the family card, never another user's personal card). NOT validated on this machine at the time of writing: Maestro was not installed, `yarn e2e` exited 2.

## E2E flows: account balance (spec 028)

Flows (tags `financial` + `spec-028`): `financial/accounts/balance-from-transactions` (initial balance, an expense today, one next month and one later this month: current balance and the end-of-month line), `financial/transactions/delete-adjustment` (editing the balance records an adjustment shown with a delete-only sheet; deleting it restores the balance), `financial/transactions/archived-account` (an archived account is not offered in the transaction form). `BALANCE_CENTS` is the INITIAL balance; `BALANCE_CENTS` and `STATUS` are caller-scoped params of `setup/create-account`, not header defaults. `e2e/scripts/future-date.js` outputs `NEXT_MONTH_DATE` and `LATER_THIS_MONTH_DATE` (empty on the last day of the month). testIDs: `financial.accounts.row-projected`, `financial.accounts.total-projected`, `financial.transactions.adjustment-row|sheet|delete|delete-dialog`. NOT validated at the time of writing: Maestro was not on the PATH and the API was an older build, `yarn e2e` was not run.

## Card purchases and invoice payment (spec 029)

- Domain: `TransactionEntity` gains `creditCardId` / `invoiceMonth` (`accountId` optional); `InvoiceEntity` gains `listDate` and `payment` (`InvoicePaymentEntity`: method ACCOUNT|EXTERNAL, `paidOn`, account); `CreditCardSummaryEntity.upcomingInvoices`; new `CardInvoiceEntity` (card + invoice + purchases). Errors `InvoiceIsPaid`, `CreditCardArchived`, `InvoiceNotPayable`.
- Data: `getTransactions` merges the API default (account rows) with `?source=CARD` purchases so the form can edit both; card datasource `getCardInvoicesForMonth`, `getCardInvoice`, `payInvoice` (409/422 → `InvoiceNotPayable`), `undoInvoicePayment`. 422 on a transaction write is mapped by message (`transactions/unprocessableError.ts`).
- Use cases (`creditCards/`): `getFinancialCardInvoicesForMonthUseCase`, `getFinancialCardInvoiceUseCase`, `payFinancialInvoiceUseCase`, `undoFinancialInvoicePaymentUseCase`. `getMonthSummaryUseCase` adds the month's invoice amounts to the expenses and ignores card purchases; `getRecentTransactionsUseCase` skips them.
- Transactions list: `Transactions/models/CardInvoiceUIModel.ts` + `components/CardInvoiceRow` (grouped line on the invoice's list day, expands to purchases, "Open invoice" opens the detail); `buildEntries(items, now, invoices)`; the invoices query is separate, so a failure shows an inline `ErrorState` and keeps the account rows.
- Form (`NewTransactionModal`): "Pay with" Account | Card (only with an active card); Card mode hides the type, shows the card select, the invoice hint, the over-limit warning and the paid-invoice error (Save disabled). `Financial/models/invoiceMonth.ts` mirrors the API billing rules. Route param `creditCardId` opens the form on a card ("Add purchase").
- Cards screen: tabs Open | Closed | Upcoming; closed invoices with an amount show **Pay**; tapping a row opens the invoice detail.
- Invoice detail: modal route `financial/invoice/invoice_detail` (params `cardId`, `month`) → `Financial/Invoice` (`useInvoiceViewModel`, `PayInvoiceSheet`: method, account picker of ACTIVE accounts, paid-on date, undo with `ConfirmDialog`). After a payment the overview, the invoice, the month lists, the accounts and the month summary are invalidated.

### E2E flows: card purchases (spec 029)

testIDs: `financial.transactions.cardInvoice.*` (`row`, `toggle`, `title`, `status`, `amount`, `paid-info`, `purchase`, `open`, `error`), `financial.invoice.*` (`screen`, `pay`, `pay-method`, `pay-account`, `pay-date`, `pay-confirm`, `paid-info`, `undo`, `undo-confirm`, `purchase`, `add-purchase`), `financial.transactionForm.payWith`, `financial.transaction-form.card-select|invoice-hint|over-limit|invoice-paid`, `financial.cards.invoice-pay|no-upcoming`. Flow: `financial/credit-cards/purchases-and-payment` (tags `financial`, `spec-029`).

## Installments (spec 030)

- Domain: `TransactionEntity` gains `installmentPlanId` / `installmentNumber` / `installmentCount` (also on `InvoicePurchaseEntity`, without the plan id); new `InstallmentPlanEntity` (+ `InstallmentEntity`: id, number, invoice month, `invoiceStatus` CLOSED|OPEN|PAID, value; `totalValue` = SUM of the installments) and `InstallmentScope` (`ONLY_THIS` | `THIS_AND_NEXT`); error `InstallmentPaid` (422 "An installment is in a paid invoice"); `FinancialInstallmentPlanRepository`.
- Data: `InstallmentPlanModel` (cents ↔ decimal strings), datasource `installmentPlans/api/*` (`POST|GET|PATCH|DELETE /v1/finance/installment-plans`, the body carries the local `today`; PATCH sends only the changed fields so the API recalculates ONLY on a real change of total/count/card/date), repository `installmentPlans/installmentPlanRepositoryImpl.ts` (invalidates the transaction and account caches). `updateTransaction` forwards `scope` for installment rows.
- Use cases: `createFinancialInstallmentPlanUseCase` (count 2–48 checked before the call), `getFinancialInstallmentPlanUseCase`, `updateFinancialInstallmentPlanUseCase` ("All"), `deleteFinancialInstallmentPlanUseCase`.
- Form (`NewTransactionModal`): in Card mode (create only) a "Parcelar / Installments" `Switch` (off by default), count field (2–48), split preview and first/last invoice hint; the amount becomes the TOTAL and Save calls `createFinancialInstallmentPlanUseCase`. Pure helpers in `Financial/models/installments.ts` (`splitInstallmentCents`, `installmentPreview`, `installmentInvoiceRange`, `installmentTitle`, `isValidInstallmentCount`). Editing an installment from the list or the invoice redirects (`router.replace`) to the installment sheet.
- `Financial/InstallmentEdit` (modal route `financial/installment/edit_installment`, param `id` = transaction id): `RadioGroup` Only this one / This and the next ones / All; `models/installmentEditState.ts` decides what is editable (`editableFields`: in a paid invoice only description and category), whether "All" must ask "Recalculating will undo changes…" (`needsRecalcConfirm`) and builds the PATCH bodies; `InstallmentPlanSheet` lists the installments with invoice month, value and status badge; delete asks "Delete all n installments?" and removes the whole plan. Invoice lines and the invoice detail title installments as "Notebook 3/10" (`financial.installment.label`).
- Kit: `RadioGroup` (`@components`, required single choice, options get `<testID>-<value>`).
- testIDs: `financial.transactionForm.installments.{switch,count,preview,invoices}`, `financial.installmentEdit.{sheet,scope,amount,description,category,count,card,date,paid-helper,form-error,recalc-confirm,save,see-plan}`, `financial.installmentPlan.{sheet,total,count,row,delete,delete-confirm}`.

### E2E flows: installments (spec 030)

`financial/credit-cards/installments` (tags `financial`, `spec-030`): a card that closed yesterday, a 3x purchase of 30,00 created in the form (switch, count, preview), 1/3 in the next invoice line and 2/3 in the one after, "Only this one" edit of 2/3 to 15,00, plan total 35,00 in the plan sheet, delete of the whole plan. Subflow `subflows/financial/scroll-list-up.yaml`. The sheet footer hides the switch on a short viewport: scroll the form (`scroll-form-down`) before tapping it.

## Installment prepayment, card refunds and early payments (spec 032)

- Domain: `InvoiceEntity` gains `amountDue, carryIn, earlyPaid, net, total` (cents; `amount` is still what is due), `CardInvoiceEntity` gains `credits: InvoiceCreditEntity[]` (`kind` `REFUND | PREPAYMENT_DISCOUNT | EARLY_PAYMENT`) and purchases a `prepaid` flag, `InstallmentPlanEntity` gains `prepayment` (`PrepaymentEntity`: id, targetInvoiceMonth, date, discount cents) and prepaid installments, `TransactionEntity` gains `earlyPayment` (`EarlyPaymentRefEntity`, set on the account debit row of an early payment), new `PrepaymentPreviewEntity`. New errors `PrepaymentBlocksEdit`, `HasRefunds`, `RefundOverPurchase`, `OverAmountDue` (mapped from the 422 messages in `transactions/unprocessableError.ts`, copy keys in `financialErrorMessage.ts`).
- Data: `installmentPlans/api/{previewPrepayment,prepayInstallmentPlan,undoPrepayment}` and the new `cardCredits/api/{create,update,delete}{Refund,EarlyPayment}` (`POST|PATCH|DELETE /v1/finance/credit-cards/:id/refunds|early-payments`, money in cents, dates `YYYY-MM-DD`, they return nothing). Repository `financialRepository.cardCredit` invalidates the transaction and account caches.
- Use cases: `previewFinancialPrepaymentUseCase`, `prepayFinancialInstallmentPlanUseCase`, `undoFinancialPrepaymentUseCase`, `create|update|deleteFinancialRefundUseCase`, `create|update|deleteFinancialEarlyPaymentUseCase` (input checked before the call). `getMonthSummaryUseCase` now adds `invoice.earlyPaid` to `invoice.amount` for the card expense of a month.
- Shared model `Financial/models/creditSheet.ts`: `assignableInvoices(summary)` (open invoice first, then closed ones without a payment record), `defaultInvoiceMonth`, `toCalendarDate`, `todayDate`.
- `Financial/Prepayment` (route `financial/prepayment/prepay_installments`, param `planId`): invoice `RadioGroup`, preview count/total, discount switch + `AmountInput`, resulting-invoice hint; opened from the plan sheet ("Prepay installments"), which also shows the prepaid badge and "Undo prepayment" (`ConfirmDialog` in `InstallmentEdit`).
- `Financial/Refund` (route `financial/refund/card_refund`, params `creditCardId` + optional `id`, `invoiceMonth`, `refundedTransactionId|refundedPlanId`, and the stored fields when editing): linked purchase/plan `SelectField`, description default "Refund · {{purchase}}", value, date, invoice, carry hint; opened from the Cards header, the invoice, a card purchase sheet ("Refund this purchase") and the installment sheet.
- `Financial/EarlyPayment` (route `financial/early_payment/card_early_payment`, params `creditCardId` + optional `id`, `invoiceMonth`; editing reads the stored payment from the invoice detail): invoice picker (only invoices with something left), "Left to pay", value (prefilled with the amount due), date (not after today), Account / Boleto `SegmentedControl`, account picker, hint; the account debit row of an early payment hands over to this sheet (`NewTransactionModal` redirects, like installments).
- `Financial/Invoice`: "+" credit lines (refund, discount, early payment; refunds and early payments open their sheet), "Credit from {{month}}" line, "Credit of … carried to …" text, "Paid early"/"Left to pay", prepaid badge, Refund and Pay early buttons (only for an invoice that has started and has no payment record), Undo only with a payment record.
- testIDs: `financial.prepayment.*`, `financial.refund.*`, `financial.earlyPayment.*`, `financial.invoice.{credit,credit-carry,carry-in,paid-early,left-to-pay,prepaid,refund,pay-early}`, `financial.installmentPlan.{prepay,prepayment,undo-prepayment}`, `financial.cards.{refund-button,early-payment-button}`.

### E2E flows: prepayment, refund and early payment (spec 032)

`financial/credit-cards/prepayment-and-refund` (tags `financial`, `spec-032`): a card that closed yesterday with a 250,00 purchase (closed invoice) and a 3x plan of 300,00 (1/3 in the open invoice), set up through the API (`scripts/setup/create-card-with-plan.js`); prepay the other two into the open invoice with a 20,00 discount (invoice 100,00 → 280,00, prepaid badges and discount line), undo it, refund 100,00 of the purchase on the closed invoice (250,00 → 150,00 and the credit line), pay 50,00 early from the account ("Paid early", "Left to pay" 100,00, the account balance and the debit row).
