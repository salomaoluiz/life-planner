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
      - status # ACTIVE | ARCHIVED (spec 041)
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
    behavior: Creates a new financial category; owner "ALL" (no ownerId) creates one All category for Personal and every family (spec 038).

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
    behavior: Updates an existing category; forwards name, icon, iconColor, type and parentId (null removes the parent); scope "ALL" turns a single-scope main category into an All one (no way back); status "ARCHIVED" / "ACTIVE" archives or reactivates it with its subtree (spec 041; 409 -> CategoryHasPendingItems, 422 -> CategoryArchived / CategoryParentArchived); never owner/ownerId/depthLevel.

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
  SectionPicker: SectionPicker/index.tsx (+ hooks/useSectionPickerViewModel.ts, testIds.ts) # BottomSheet (modal route financial/section_picker) with one ListItem per FINANCIAL_SECTIONS entry (spec 044)
  Layout: Layout/index.tsx # FinancialLayout: Screen, header (overline + section title, pressable below `expanded`), 720 column; sections render plain Views
  files: [Layout/headerActions.tsx, Layout/hooks/useFinancialLayoutViewModel.ts, Layout/models/financialSections.ts, Layout/styles.ts]

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
  models: [Categories/models/CategoryRowUIModel.ts, Categories/models/categoryEntries.ts] # entries = active tree, then the collapsed "Archived (N)" group (spec 041)
  form: Categories/modals/NewCategoryModal/
    - index.tsx, styles.ts
    - hooks/useNewCategoryViewModel.ts
    - models/{categoryFormState.ts,NewCategoryUIModel.ts}
    - components/{CustomColorSheet,IconPickerSheet}/index.tsx # the archive / reactivate action sits at the end of the form body; the blockers use the shared `@components` PendingItemsDialog (spec 041, reused by families in spec 042)

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
- Invoice detail: modal route `financial/invoice/invoice_detail` (params `cardId`, `month`) → `Financial/Invoice` (`useInvoiceViewModel`, `PayInvoiceSheet`: method, account picker of ACTIVE accounts, paid-on date, undo with `ConfirmDialog`). After a payment the overview, the invoice, the month lists, the accounts and the month summary are invalidated. The screen caches the `CardInvoiceUIModel` under `listQueryKey(getFinancialCardInvoiceUseCase.uniqueName)`; the early payment form caches the raw `CardInvoiceDTO` under `[uniqueName, cardId, month]`. The two must never share a key (Sentry LIFE-PLANNER-5Z / -61).

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
- `Financial/Refund` (route `financial/refund/card_refund`, params `creditCardId` + optional `id`, `invoiceMonth`, `refundedTransactionId|refundedPlanId`, and the stored fields when editing): the linked purchase/plan is a fixed read-only field, shown only when the sheet is opened from that purchase or plan (never from an invoice or the Cards header); description default "Refund · {{purchase}}", value, date, invoice, carry hint; opened from the Cards header, the invoice (no link), a card purchase sheet ("Refund this purchase") and the installment sheet.
- `Financial/EarlyPayment` (route `financial/early_payment/card_early_payment`, params `creditCardId` + optional `id`, `invoiceMonth`; editing reads the stored payment from the invoice detail): invoice picker (only invoices with something left), "Left to pay", value (prefilled with the amount due), date (not after today), Account / Boleto `SegmentedControl`, account picker, hint; the account debit row of an early payment hands over to this sheet (`NewTransactionModal` redirects, like installments).
- `Financial/Invoice`: "+" credit lines (refund, discount, early payment; refunds and early payments open their sheet), "Credit from {{month}}" line, "Credit of … carried to …" text, "Paid early"/"Left to pay", prepaid badge, Refund and Pay early buttons (only for an invoice that has started and has no payment record), Undo only with a payment record.
- testIDs: `financial.prepayment.*`, `financial.refund.*`, `financial.earlyPayment.*`, `financial.invoice.{credit,credit-carry,carry-in,paid-early,left-to-pay,prepaid,refund,pay-early}`, `financial.installmentPlan.{prepay,prepayment,undo-prepayment}`, `financial.cards.{refund-button,early-payment-button}`.

### E2E flows: prepayment, refund and early payment (spec 032)

`financial/credit-cards/prepayment-and-refund` (tags `financial`, `spec-032`): a card that closed yesterday with a 250,00 purchase (closed invoice) and a 3x plan of 300,00 (1/3 in the open invoice), set up through the API (`scripts/setup/create-card-with-plan.js`); prepay the other two into the open invoice with a 20,00 discount (invoice 100,00 → 280,00, prepaid badges and discount line), undo it, refund 100,00 of the purchase on the closed invoice (250,00 → 150,00 and the credit line), pay 50,00 early from the account ("Paid early", "Left to pay" 100,00, the account balance and the debit row).

## Paid status (spec 033)

- `TransactionEntity` / `TransactionDTO` / `TransactionModel` carry `paid: boolean` (account rows: stored status; card rows: derived by the API from the invoice; a response without it counts as paid). `createTransaction` / `updateTransaction` send `paid` and `?today=`; `getTransactions` sends `today` so card rows get their derived status.
- `getMonthSummaryUseCase` returns `toPay` (unpaid account expenses of the month + `amountDue` of the month's invoices that are not `PAID`) and `toReceive` (unpaid incomes); income/expense totals are unchanged.
- List: `TransactionUIModel.canPay` (unpaid, no card, no system key) and `isOverdue` (`canPay` and dated before today). `TransactionRow` shows the overdue `Badge` (`meta` of `ListItem`) and a check `IconButton`; `usePayTransaction` sends `{ paid: true }` through `updateFinancialTransactionUseCase` (the API moves the date to today), then `onRefresh`. There is no snackbar in the kit: a failure shows the generic error text under the summary and the row stays unpaid. Unpaying is only possible from the form.
- Summary: "To receive" / "To pay" sit under Income / Expenses in `MonthSummary` (a compact caption row; a separate row pushed the list below the fold of the E2E viewport).
- Form: `transactionFormState` has `paid`, `paidTouched`, `originalPaid`; `changeDate` (create follows the date until touched, edit never follows) and `changePaid` (turning on with a future date on create, or on an unpaid stored row on edit, sets the date to today). The switch (`financial.transactionForm.paid`, label Paid/Received by type) is hidden in Card mode and `toCreateParams` sends no `paid` for cards.
- Home latest transactions: `RecentTransactionDTO.isOverdue` shows the same badge (`home.latest-transactions.overdue`).
- testIDs: `financial.transactions.row.pay`, `.row.overdue`, `.summary.toPay`, `.summary.toReceive`, `financial.transactionForm.paid`.

### E2E flows: paid status (spec 033)

`financial/transactions/paid-status`: an unpaid bill from last month shows the overdue badge, the pay button and "To pay"; one tap moves it to today, the account balance counts it; turning "Paid" off in the form makes it unpaid again; the card form hides the switch. `create-transaction` takes `PAID`. The date-follow rules of the switch are covered by unit tests (the date picker has no ids).

## Recurring transactions (spec 034)

A series repeats a transaction weekly, every 2 weeks, monthly or yearly, optionally until an end date. The API creates the real occurrences up to the end of the current month on read; later ones are projected (never stored). Owner and kind never change on a recurring row.

- Domain/data: `RecurrenceEntity`, `ProjectedOccurrenceEntity`, `RecurrenceResultEntity`; `FinancialRecurrenceRepository` (`financialRepository.recurrence`) with `createRecurrence`, `getRecurrences`, `getProjections`, `updateRecurrence` (scope ALL), `splitRecurrence` (THIS_AND_NEXT), `materializeOccurrence` (ONLY_THIS on a projected occurrence), `deleteOccurrence`, `deleteRecurrence`. `recurrences/api/*` call `/v1/finance/recurrences/*` (`today` is the device's local day). `TransactionEntity` / `TransactionDTO` / `TransactionModel` gain `recurrenceId`, `occurrenceNumber`, `occurrenceCount`, `recurrenceFrequency` (`TransactionDTO` also has the front-only `isProjected`). `ApiBusinessError.details` keeps the NUMERIC fields of an error body (counts only, never text): the 409 of a delete with paid occurrences becomes `RecurrenceHasPaidOccurrences` (`paidCount`, `paidTotal` in cents, `detachedCount`). 422 messages map to `RecurrencePaidAfterEnd`, `RecurrenceFrequencyBlocked` and `InvoiceIsPaid`.
- Use cases (`cases/financial/recurrences`): `createFinancialRecurrenceUseCase`, `updateFinancialRecurrenceUseCase`, `splitFinancialRecurrenceUseCase`, `materializeFinancialOccurrenceUseCase`, `deleteFinancialOccurrenceUseCase`, `deleteFinancialRecurrenceUseCase`, `getFinancialRecurrencesUseCase`, `getFinancialProjectionsUseCase`. `deleteFinancialTransactionUseCase` takes `scope` (required by the API on a recurring row). `getMonthSummaryUseCase` adds `projectedExpense` / `projectedIncome` for months after the current one (account occurrences dated in the month + card occurrences whose invoice `invoiceListDate` is in it).
- Form (`NewTransactionModal`): the "Repeat" `SwitchRow` (create only), frequency chips, optional end date (`DateField` clearable) and a preview from `Financial/models/recurrence.ts` (a mirror of the API schedule: month-end clamp, 29 Feb). Repeat and Installments are mutually exclusive (`changeRepeatOn` / `changeInstallmentsOn`). The "Paid" switch applies to the first occurrence ("Applies to this first one"). Editing a recurring row (real, or projected: opened with `recurrenceId` + `occurrenceNumber` + `month` params) shows a scope `RadioGroup`; `models/recurrenceEdit.ts` maps scope + changed fields to the call (only the CHANGED fields are sent, so a customised value of another occurrence is never reset): ONLY_THIS → `PATCH /transactions/:id` with `scope` (or `materializeOccurrence` when projected), THIS_AND_NEXT → split, ALL → series patch. Locked controls follow FR 20 (`recurrenceLocks`) with a "Change this in ..." helper. Changing the scope restarts from the stored values.
- Delete: `RecurrenceDeleteSheet` (three scopes); "All" asks `Delete all occurrences?`, and a 409 opens a second dialog with the paid counts and "Delete anyway" (retries with `confirmPaid`). Account and card forms show "{{count}} recurring transactions will end" before archiving (the API ends the series).
- List: recurring rows show the repeat icon, a counter `k/n` only with an end date (otherwise the frequency in the subtitle); projected rows (months after the current one) are muted with a "Projected" badge and no pay button; card projections go inside the invoice line of the month the invoice appears ("Includes projected"; a line that only exists as a projection cannot be opened) and in a "Projected (n)" section of the invoice detail, which never changes the payable amount. `MonthSummary` shows the "Projected" line when non-zero. Projections are fetched for `[month-2 .. month]` limited to months after the current one.
- testIDs: `financial.transaction-form.repeat`, `.repeat-frequency-<WEEKLY|BIWEEKLY|MONTHLY|YEARLY>`, `.repeat-end` (`-clear`), `.repeat-preview`; `financial.recurrence-edit.scope-<ONLY_THIS|THIS_AND_NEXT|ALL>`; `financial.recurrence-delete.scope-<...>`, `.sheet`, `.confirm`, `.paid-confirm`; `financial.transactions.row-recurring`, `.row-projected`, `.row.repeat`, `.row.projected`, `.summary-projected`; `financial.account-form.archive-warning`, `financial.card-form.archive-warning`. The recurring row title id is `<row testID>-title` (`row-recurring-title` / `row-projected-title`).

### E2E flows: recurring transactions (spec 034)

`financial/transactions/recurring-create` (a series with an end date made through the API: the real row shows the repeat icon and `1/4`, next month shows the projected row with its badge and the summary line), `recurring-no-end` (a weekly series with no end date created through the form: icon and no counter), `recurring-edit-scopes` ("This and the next ones" changes the value from this month on, last month keeps the old one), `recurring-delete-all-paid` (deleting "All" asks twice because an occurrence is paid; the rows disappear and the balance comes back), `recurring-card-exclusive` (Repeat and Installments turn each other off). The end-date picker (`react-native-paper-dates`) has no ids, so the form flows leave the end date empty; the count preview and the schedule are unit tested. New setup: `subflows/setup/create-recurrence.yaml` / `scripts/setup/create-recurrence.js` (`DESCRIPTION`, `VALUE_CENTS`, `FREQUENCY`, `MONTHS_AGO`, `END_MONTHS_AFTER_START`, `PAID`; output `RECURRENCE_ID`).

## Daily balance in the list and card payment account (spec 035)

- **Data chain:** `getFinancialDailyBalancesUseCase` (`financial.get_daily_balances_use_case`) → `accountRepository.getDailyBalances` → `GET /v1/finance/accounts/daily-balances?month=&ownerId=&today=`; `DailyBalanceModel` / `DailyBalanceEntity` / `DailyBalanceDTO` keep money in **cents** (`totalCents`, `cardsDueCents`, per account `balanceCents`). Never cached in the repository.
- **List:** `useTransactionsViewModel` loads the balances in parallel with the list (key `[...listQueryKey(uniqueName), monthKey, ...scope owner ids]`, enabled up to 12 months after the current one; refetched with the list on focus and pull to refresh). `buildEntries(..., { balances, expandedDateKey })` puts `balanceCents`/`projected` on each day `header` and, for the expanded day, `balanceLine` entries (one per account in API order + the "Card invoices to pay" line only when ≠ 0). A header without balance data (loading, failed, beyond 12 months) keeps the day net as its trailing value and cannot expand. The type filter never changes balances; changing month or scope collapses the day.
- **Header:** `GroupHeader` with `onPress` / `expanded` / `meta` (day net as secondary text) / `tooltip` (web hover bubble via the kit `Tooltip`), `DayBalanceLine` component for the lines, "Projected" mark when the day counts projected items.
- **Card form:** field "Pay from account" (`paymentAccountId`, "None" clears it with `null`); an archived linked account stays selectable and is labeled; an account the reader cannot see shows "Account of another member". The invoice payment sheet preselects the linked account when it is active.
- testIDs: `financial.transactions.day-balance-<YYYY-MM-DD>`, `.day-balance-line-<accountId>`, `.day-balance-cards`, `.day-balance-projected`; `financial.card-form.payment-account`.
- E2E: `financial/transactions/daily-balance` (balances today/yesterday, tap to expand, type filter, next month with a monthly series and the projected mark) and `daily-balance-card-link` (card invoice on the "card invoices" line, link the card in the form, the invoice moves into the account line, the pay sheet preselects the account). New helper `e2e/scripts/today-dates.js`. The "balances request fails" criterion cannot be forced from Maestro: it is covered by the view model and screen Jest tests. Maestro reads the text of a header's children, so assert balances with `childOf`.

## Responsive modal layout (spec 037)

On `medium`/`expanded` these modals are `BottomSheet size="form"` with `FormColumns` (two columns) and Delete in the footer (`footerStart`): `NewTransactionModal`, `NewAccountModal`, `NewCreditCardModal`, `NewCategoryModal`, `InstallmentEdit`, `Invoice` (320 px summary column + purchases, actions as one wrapping row), `Prepayment`, `Refund`, `EarlyPayment`. Compact is unchanged. Pickers, sheets and confirmations stay `dialog` (480 px).

## Category scopes (spec 038)

`CategoryEntity`/`CategoryModel`/`CategoryDTO` carry `scope` (`PERSONAL | FAMILY | ALL`) and the owner ids it covers (`scopeOwnerIds`; the model keeps the API `scopes`). An All category is ONE record that every list and picker shows once. Always test membership with `categoryInScope(category, ownerId)` (`screens/Financial/models/categoryTree.ts`), never `category.ownerId === ownerId`. In the category form the owner choice `ALL` (`ALL_OWNERS`) is the All option; Categories rows show a "Todas"/"All" badge (`financial.categories.scope-all`) or the owner badge (`financial.categories.owner-badge`). Flow: `e2e/flows/financial/categories/all-scope-category.yaml`.

## Save and add another (spec 039)

- **Form** (`NewTransactionModal`, create only; never when editing or on a projected occurrence): a second footer button `Button.Secondary` "Save and add another" (`financial.transactions.form.saveAndNew`, testID `financial.transaction-form.save-and-new-button`). `BottomSheet` takes `footerSecondary`: stacked below Save on compact, before Save on one end-aligned row on a wide `form` sheet. Both buttons are disabled while saving; only the pressed one spins (`vm.isSavingNext`).
- **Flow:** `useNewTransactionViewModel` keeps `saveIntent` (`"close"` for Save, `"next"` for Save and add another). On success with `"next"` the modal stays open: `resetForNext(state)` (`models/transactionFormState.ts`) keeps type, category, account/card, pay with, date and owner and clears amount, description, repeat and installments (the create defaults in `REPEAT_AND_INSTALLMENTS_DEFAULTS`) and sets Paid to follow the date again; the reset state becomes the baseline for `isDirty`; every mutation is `reset()` (new `reset` on `@infrastructure/fetcher` `useMutation`) so the next success is detected; the amount input is focused (`AmountInput` `inputRef`). On error nothing is cleared.
- **Notice:** kit `Toast` (`financial.transactions.form.saved`, testID `financial.transaction-form.saved-toast`, hides after 3 s, polite live region), placed by the screen via `bottom`.
- E2E: `financial/transactions/save-and-new` (tag `spec-039`): save and add another, notice, cleared amount, empty-amount validation, second entry with the kept category, both rows in the list.

- **Currency per resource** (spec 040): every account, card, transaction, recurrence, installment plan, projection and invoice entity/model/DTO has `currency` (`CurrencyCode`, `toCurrencyCode` fallback `BRL`). `formatAmount(cents, localeTag, currency, type?)`, `AmountText` and `AmountInput` take the currency explicitly; screens pass the row's/card's/invoice's currency, view models expose `currency` (`useNewTransactionViewModel`: the chosen account/card; early payment, prepayment, refund, installment edit: the card/plan), aggregates pass `DEFAULT_CURRENCY`. No form field and no i18n key: requests never send `currency`.

## Archived families (spec 042)

- The owner filter of Transactions, Accounts, Cards and Categories (and Stock / Home) lists archived families last with the `archive-outline` marker; `ownerOptions.buildOwnerChoices` (creation pickers) leaves them out and `activeOwners`/`activeOwnerIds`/`archivedOwnerIds`/`isArchivedOwner` are the helpers. The forms read their owners through `models/activeOwners.ts` (`fetchActiveOwners`, cache key `[getOwnersUseCase.uniqueName, "active"]`).
- "All" leaves the archived families out: the list filters (`filterByOwner`, `filterInvoicesByOwner`, `filterSummariesByOwner`, `filterCardsByOwner`, `categoryInActiveScope`) take the archived owner ids, the month summary and the daily balances use `activeOwnerIds`.
- Read-only: selecting an archived family sets `vm.readOnly` (`hooks/useReadOnlyScope.ts`): no add / edit / refund / early payment buttons, a `ReadOnlyNotice` banner (`<screen>.readonly-banner`) and a `Toast` (`<screen>.readonly-toast`, `family.archived.readOnly`) instead of opening a form (`guard()` wraps the row, invoice and add handlers). A 422 "Family is archived" maps to `FamilyArchived` (`financialApiError`, copy `family.errors.archived`).

## Transaction tags (spec 043)

- **Slice:** `TagEntity`/`TagModel`/`TagDTO` (scope `PERSONAL | FAMILY | ALL`, `scopeOwnerIds`, `usageCount`), `FinancialTagRepository` (`tags/tagRepositoryImpl.ts`, cache `CACHE_FINANCIAL_TAG_DATA`), datasource `financialTagDatasource` (`tags/api/{get,create,update,delete}Tag.ts`, 409 -> `TagNameInUse`), use cases `get|create|update|deleteFinancialTagUseCase` (name trimmed, 1-30 characters). `tags: { id, name }[]` on `TransactionEntity/Model/DTO` and on projected occurrences; write params carry `tags?: string[]` (transaction, installment plan, recurrence create/update/split, materialize).
- **Tags screen:** section `tags` (`/financial/tags`, after Categories) `screens/Financial/Tags` (view model + `buildTagRows` sorted by name, scope filter chips, usage / "Not used", `Badge` "All" or owner), modal route `/financial/tag/add_new_tag` (`NewTagModal`: Name, Belongs to with All, usage line, delete through `ConfirmDialog` worded by case). testIDs `financial.tags.*` (`screen`, `add-button`, `scope-filter-<ownerId|ALL>`, `row-<id>[-title]`, `scope-all`, `owner-badge`, `empty-state`) and `financial.tag-form.*` (`name-input`, `owner-<id|ALL>`, `save-button`, `delete-button`, `delete-dialog`, `usage`, `form-error`).
- **Transaction form:** field Tags (`AutocompleteField` chips, testID `financial.transaction-form.tags` -> `-input`, `-suggestion-<name>`, `-create`, `-chip-<name>`, `-chip-remove-<name>`) after the category chips. `TransactionFormState.tags: string[]` (names): `resetForNext` keeps it, `isSameState` compares it, `stateFromDto` loads it, every `to*Params` sends it, `buildRecurringSave` sends it when changed. Suggestions: the tags of all owners (one cache entry) filtered by the chosen owner, by usage then name; changing Belongs to keeps the chips as names (the API resolves them in the new owner). Installments are edited in `InstallmentEdit` without a tags field (a recalculation keeps the tags of the first installment).
- E2E: `financial/tags` and `financial/transaction-tags` (tag `spec-043`).
- **Transaction filters (spec 045):** `TransactionQueryFilter` (domain) and `appendFilterParams` (`data/datasource/data/financial/filterQuery.ts`) feed `getFilteredTransactionsUseCase` (account rows, no cache), `getFinancialCardInvoicesForMonthUseCase` (`filter` with `from`/`to` instead of `month`; invoices carry `filtered { filteredTotal, matchedCount, purchaseCount }`) and `getFinancialProjectionsUseCase` (`filter`). Screen: `Transactions/models/transactionFilters.ts` (groups, period rules, presets, `summarize`), `hooks/useTransactionFilters.ts` (module-level store, 300 ms search debounce), `hooks/useFilterOptions.ts`, `components/FilterToolbar` + `FilteredSummary`, `modals/FiltersModal` (draft, two columns wide / steps compact), `models/categoryPicker.ts`, `models/filterLabels.ts`. Kit: `Checkbox`, `FilterButton`, `RemovableChip`.
- E2E: `financial/transactions/filters-category-period` and `filters-empty-state` (tag `spec-045`).
- **Overview (spec 046):** section `overview` (`/financial/overview`, first in the menu) `screens/Financial/Overview` (view model, blocks, `models/`, own filters store). Data: `FinancialDashboardRepository` / `financialDashboardDatasource` (`dashboardQuery`, `getSummary`, `getBalanceSeries`, `getTotals`, never cached) and `getFinancialDashboardSummaryUseCase`, `getFinancialBalanceSeriesUseCase`, `getFinancialTotalsUseCase`; entities in `DashboardEntity`. Kit: `StatTile`, `ChartCard`, `BarList`, `LineChart`, `ColumnChart` (`react-native-svg`). `FiltersModal` takes `hidePeriod`; `FilterToolbar` takes `searchTestID` / `filtersTestID`.
- **Overview wide layout, averages and archived sources (spec 052):** on the `expanded` breakpoint the Finances `Screen` gets `maxWidth = overviewMaxWidth(window, RAIL_WIDTH)` (70% of the window, at least 960 px, never past the area next to the rail; `Layout/models/overviewWidth.ts`, returned as `maxWidth` by `useFinancialLayoutViewModel`, Overview only). Tiles: 4 columns when each gets ≥ 220 px, else 2 × 2 (`tileColumns`), values fitted by `StatTile` (`fitValue`: full → one size smaller → `compactAmount`). Legends: average per month = total ÷ `monthsInPeriod(period)` (`averagePerMonth`, none for one month), passed through `foldBars({ averageOf })`; a table (`columns`) on wide screens, a second line on mobile. `LineChart` reserves the longest y-label width (`axisWidth`). The backend leaves archived accounts/cards out of the dashboard from their archive day (see `.claude/context/backend.md`).
- **Overview periods into the future (spec 053):** presets `1M, 3M, 6M, 12M, YEAR, CUSTOM`; NM = N months back (the current one counts) and N ahead, Year = January–December, default `1M` (`overviewPeriod.periodForPreset`). Custom accepts any range up to 2 years whose end is at most `maxFutureDate(today)` (last day of the month 24 months after the current one); `CustomPeriodSheet` is a two-column `FormColumns` dialog on `medium`/`expanded` (with Cancel and a period summary in the footer) and the compact sheet on phones. Everything after today is projected (recurrences included, computed by the API). `summary.balance.projectedEnd` feeds a second accent line on the balance tile (`StatTile.extra`, `financial.overview.tile-balance-projected-end`); the income/expense/result deltas say "incl. projected" when the period has projected amounts; `LineChart`/`ColumnChart` take `today` (`todayIndex` picks the bucket) and draw the Today marker (`<testID>-today`); category/tag legends show the projected part (`BarListRow.projected`, a Projected column on the wide table). The 052 monthly average divides by every month of the period.
- E2E: `financial/overview/open-overview-and-drill` (tag `spec-046`), `financial/overview/average-per-month` (tag `spec-052`).
- **Transactions CSV (spec 047):** Import CSV and Export CSV on the Transactions screen (`components/CsvActions`: since spec 050 the ⋮ "More actions" button of the Finances header on every breakpoint, with an anchored `Menu` on wide layouts and a modal `BottomSheet` on compact; state in `hooks/useCsvActions.ts`).
- **Transactions FAB (spec 050):** `Fab` (kit) pinned bottom-right of the Transactions screen (icon-only 56×56 at 16 px on compact, extended "New transaction" at 32 px on wide; hidden during the first-load skeleton, shown in loaded/empty/filtered-empty/error states); the list reserves 88/120 px at its end (`styles.listContent`). It calls `onAddPress`, which passes the scope owner to `/financial/transaction/add_new_transaction` as the `ownerId` route param (omitted for All; ignored by the form if unknown). The header slot lives in `Financial/Layout/headerActions.tsx` (`FinancialHeaderActionsProvider`, `useFinancialHeaderActions(node, version)`: the slot refreshes only when `version` changes). testID `financial.transactions.fab`; flow `transactions-fab` (tag `spec-050`).
  - **Infrastructure:** `@infrastructure/csv` (`parseCsv`, `decodeCsv` with BOM removal and the Windows-1252 fallback; wraps `papaparse`), `@infrastructure/filePicker` (`pickCsvFile`, `setE2eCsvFixture`; wraps `expo-document-picker`), `@infrastructure/fileSave` (`saveCsvFile`: a download on web, the share sheet on mobile; wraps `expo-file-system` + `expo-sharing`), `api.getText` (the CSV text and the attachment filename).
  - **Data:** domain `TransactionCsv` (`ExportQuery`, `ExportRequest`, `ImportRowEntity`, `ImportValidationEntity`) and `ImportRowsInvalid` (422 with the refused rows); datasource `exportTransactions`, `getExportCount`, `validateImport` (dry run), `importTransactions` (`transactions/api/{exportTransactions,getExportCount,importTransactions}.ts`); repository `importTransactions.ts` refreshes the transaction, account and tag caches; use cases `exportFinancialTransactionsUseCase`, `getFinancialExportCountUseCase`, `validateFinancialImportUseCase`, `importFinancialTransactionsUseCase`.
  - **Rules (pure, `src/application/csvImport/`):** `detect` (separator, decimal, date format), `parseValues` (`parseAmountCents`, `parseDate`), `suggestColumns` (header words, both languages), `mapping` (`applyTarget`, `fieldStatuses`, `canContinue`), `distinctValues` (`autoMatch`, `matchType`, `matchPaid`, system category names), `buildRows` (one API row per file row, local row errors, system rows skipped). Screen models: `models/importFile.ts` (read and detect, 2 MB / 2,000 rows), `importValues.ts`, `importReview.ts`, `importWizard.ts`, `exportCsv.ts`.
  - **Export modal:** `modals/ExportModal` (own period with presets, owner chips, accounts and cards picker, format, live count debounced 300 ms; never follows the screen filters). testIDs `financial.export.*`.
  - **Import wizard:** `modals/ImportWizard` (`useImportWizardViewModel` keeps the state and the footer rules; `steps/{File,Columns,Values,Review}Step.tsx` with their `use*StepViewModel`); wide `BottomSheet size="wizard"` (1040 px on expanded) and kit `Stepper`. A category value written as a path (`Parent > Child`, also `/` and `:`) creates every missing level, parent first, reusing existing ones (`models/categoryChain.ts`). **Owner per row:** the "Belongs to" column (header `Pertence a`/`Belongs to`/`Dono`/`Owner`) is matched to Personal or a family in the `owner` value tab; empty cells take the owner of step 1. Accounts, cards and categories are matched in the owner of each row (`useImportRecords` returns the records per owner; value-map keys are `<ownerId>|<value>` and `<ownerId>|<type>|<value>`, `application/csvImport/owner.ts`) and each payload carries `owner`/`ownerId`. Records created in step 3 use the existing create use cases with defaults (`IMPORTED_CATEGORY_DEFAULTS`, `IMPORTED_CARD_DEFAULTS`). testIDs `financial.import.*` (`column.<i>`, `required.<field>`, `fixed.<field>`, `value-tab-<tab>`, `value.<tab>.<i>`, `row.<line>`, `filter-<ALL|ERRORS|DUPLICATES>`, `submit`).
  - **E2E:** the browser file chooser cannot be driven by Maestro, so the dev-only route `/e2e-csv#name=<file>&csv=<url-encoded text>` (`screens/Dev/E2eCsv`, `EXPO_PUBLIC_E2E_LOGIN=true`) leaves the file for the wizard's next pick. Flows `financial/transactions/{import-csv,import-csv-missing-column,export-csv,export-csv-empty}` (tag `spec-047`).

- **CSV import: card credits and invoice payments (spec 048):**
  - **Rules** (`src/application/csvImport`): `cardCredits.ts` (the four system categories with their fixed ids and names in both languages, `matchCreditCategory`, `creditKeyOf`, `isPaymentCategory`), the `invoice` column target (`parseInvoiceMonth` in `parseValues.ts`, header words in `suggestColumns.ts`), `rowsWithCardAndAccount` in `mapping.ts`. `buildRows` sends `invoiceMonth` on card rows, moves the account of a card + account payment row to `paidFromAccountId`, and skips (and counts) balance adjustments and invoice payments on an account without a card; only `Balance adjustment` names are system rows now.
  - **Wizard:** step 2 has the Invoice target with its caption and the "card and account are payments" note; step 3 offers the card credit categories (the select item description is the group name) for values used by card rows, auto matches them by name (`ValueEntry.cardRows`, `misusedRows`), and the create form can make a category in the value's owner or in **All** (`CreateForm.scope`, `createCategoryChain(..., "ALL")`); after "Create and use" it opens the next unmatched value (`nextUnmatchedKey`) with the last Belongs to chosen kept (`lastScope`) and the matched row blinks (`Highlight`); step 4 shows credits and payments, "paid from {{account}}" / Boleto, error params and the per-invoice summary from the dry run (`ImportValidationEntity.invoices`).
  - **Layout:** the wizard is `BottomSheet size="fluid"` (`fluidSheetSize`: window − 64 px, 1040-1440 wide, up to 960 tall; the 047 sheet below 1040 px of window), `FormColumns` becomes two panes (`leftFlex`/`rightFlex`, `leftPaneTestID`/`rightPaneTestID`, `leftScrollRef`): only the left one scrolls. Text uses `TruncatedText`.
  - **Checking rows in the review:** a check or uncheck only changes local state (spec 049; the 300 ms debounce is gone). The first dry run still runs once when the review opens; afterwards the **Refresh review** button sends only the checked rows plus `includeDuplicates` (the checked duplicates, which the API counts in the invoice math). `selectionKey` is the sorted checked lines: while it differs from the snapshot of the last successful check the review is **stale**, Import is disabled and the invoices show "Values from the last check"; a failed refresh keeps the previous values and blocks Import. `revalidationRequest` / `mergeValidation` / `selectionKey` in `models/importReview.ts`.
  - **Review blocks and subtotals (spec 049):** step 4 splits the rows into an **Account** block (account transactions, invoice payments, rows without a record) and a **Card** block (purchases, refunds, discounts, early payments), each grouped by account/card (name ascending, case/accent-insensitive; `Account not found` / `Card not found`, `Boleto`, `No account or card` last). Group/block income and expenses come only from checked rows without errors, as integer cents, per currency (BRL first, never converted). `reviewGroups`, `reviewBlockOf`, `groupKeyOf`, `currencyTotals` and `selectionKey` in `models/importReview.ts`; the View (`ReviewStep` + `useReviewStepViewModel`) also keeps the filter-independent subtotals and the per-page rows (Show more = 100). New testIDs `financial.import.group.<account|card>` / `.<index>` / `.income` / `.expenses`, `financial.import.refresh`, `financial.import.stale`. Unit tests: `importReview.test.ts` ("review groups (spec 049)") and the wizard suite.
  - **E2E:** `financial/transactions/{import-card-credits,import-card-credits-mismatch,import-card-credits-early-payments,import-csv-create-scope}` (tag `spec-048`, fixture `e2e/scripts/csv-import-credits-fixture.js`).
- **Filters modal categories and sources (spec 051):** Categories is a search (`components/CategorySearchField`: `SearchField`, `ResultsPanel` dropdown on wide / inline on compact, `OptionRow` results, `RemovableChip` with `dotColor` for the picked ones) over `categoryPicker.buildCategoryIndex` / `searchCategories` (normalized once per load, max 8, contains on name and parent name, `typeFirst` from the Transactions type filter, `coveredBy` for children of a picked parent). The view model exposes `categoryResults`, `selectedCategoryChips`, `onCategoryPick`, `onCategoryRemove`; the mobile "Escolher categorias" step is gone (`FiltersStep` = `period | root | sources`). Archived accounts and cards are not listed, except ids already in the filter applied when the modal opened. The modal uses `presentation="modal"` (scrim over the whole window) and `BottomSheet paneScroll` (fixed height, each `FormColumns` column scrolls alone).
