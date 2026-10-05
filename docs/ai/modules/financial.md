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
    behavior: Updates an existing category.

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
      - financialApiError: src/data/datasource/data/financial/financialApiError.ts   # 400 -> FieldInvalid, 403 -> FinancialOwnerNotAllowed, 404 -> FinancialNotFound, 409 on delete -> AccountHasTransactions, other -> GenericError
      - ownerQuery: src/data/datasource/data/financial/ownerQuery.ts                 # ?ownerId=a&ownerId=b (empty ownerIds -> no request)
      - money: src/data/models/financial/money.ts                                    # cents <-> decimal number / decimal string
  categoriesDatasource (API):
    path: src/data/datasource/data/financial/categories/api/
    uses: "@infrastructure/api (/v1/finance/categories); never sends depthLevel, owner or ownerId on update, drops depthLevel on create; CategoryModel JSON = API shape ('black' <-> #000000 via models/financial/iconColor.ts, parentId null <-> undefined)"
    methods:
      - createCategory: src/data/datasource/data/financial/categories/api/createCategory.ts
      - deleteCategory: src/data/datasource/data/financial/categories/api/deleteCategory.ts   # 409 -> CategoryHasTransactions
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

```yaml
screens:
  Transactions:
    path: src/presentation/screens/Financial/Transactions/index.tsx
  Categories:
    path: src/presentation/screens/Financial/Categories/index.tsx
  Accounts:
    path: src/presentation/screens/Financial/Accounts/index.tsx

containers:
  - name: ListHeader
    path: src/presentation/screens/Financial/Transactions/containers/ListHeader/index.tsx
  - name: ListItem
    path: src/presentation/screens/Financial/Transactions/containers/ListItem/index.tsx
  - name: RefetchCache
    path: src/presentation/screens/Financial/Transactions/containers/RefetchCache/index.tsx
  - name: ItemSeparator
    path: src/presentation/screens/Financial/Transactions/containers/ItemSeparator/index.tsx
  - name: ListItem (Accounts)
    path: src/presentation/screens/Financial/Accounts/containers/ListItem/index.tsx

modals:
  - name: NewTransactionModal
    path: src/presentation/screens/Financial/Transactions/modals/NewTransactionModal/index.tsx
  - name: NewCategoryModal
    path: src/presentation/screens/Financial/Categories/modals/NewCategoryModal/index.tsx
  - name: NewAccountModal
    path: src/presentation/screens/Financial/Accounts/modals/NewAccountModal/index.tsx

view_models:
  - name: FinancialTransactionViewModel
    path: src/presentation/screens/Financial/Transactions/models/FinancialTransactionViewModel.ts
  - name: NewTransactionViewModel
    path: src/presentation/screens/Financial/Transactions/modals/NewTransactionModal/models/NewTransactionViewModel.ts
  - name: FinancialCategoryViewModel
    path: src/presentation/screens/Financial/Categories/models/FinancialCategoryViewModel.ts
  - name: NewCategoryViewModel
    path: src/presentation/screens/Financial/Categories/modals/NewCategoryModal/models/NewCategoryViewModel.ts
  - name: FinancialAccountViewModel
    path: src/presentation/screens/Financial/Accounts/models/FinancialAccountViewModel.ts
  - name: NewAccountViewModel
    path: src/presentation/screens/Financial/Accounts/modals/NewAccountModal/models/NewAccountViewModel.ts
```

## Presentation notes (accounts)

- `Financial/hooks/useFinancialErrorFeedback` opens `/business_feedback` (type Error) for `AccountHasTransactions`, `FinancialNotFound` and `FinancialOwnerNotAllowed`; the account delete hook passes its mutation error to it.
- The Categories delete asks for confirmation only when the category has subcategories (they are deleted too) and shows `financial.categories.errors.hasTransactions` on 409 (`CategoryHasTransactions`).
- Error mapping (all three resources, `financialApiError.ts`): 400 -> `FieldInvalid`, 403 -> `FinancialOwnerNotAllowed`, 404 -> `FinancialNotFound`, 409 on account/category delete -> `AccountHasTransactions` / `CategoryHasTransactions`, other -> `GenericError`. Contexts hold ids only.
- The transaction modal lists only the categories whose type equals the selected transaction type (the API rejects a mismatch); transaction deletes use `useFinancialErrorFeedback`.
