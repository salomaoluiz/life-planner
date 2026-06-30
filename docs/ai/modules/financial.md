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
      - (Properties define the financial category structure)
  TransactionEntity:
    path: src/domain/entities/financial/TransactionEntity.ts
    properties:
      - (Properties define the financial transaction structure)

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
  accountsDatasource (Supabase):
    path: src/data/datasource/data/financial/accounts/supabase/
    methods:
      - createAccount: src/data/datasource/data/financial/accounts/supabase/createAccount.ts
      - deleteAccount: src/data/datasource/data/financial/accounts/supabase/deleteAccount.ts
      - getAccounts: src/data/datasource/data/financial/accounts/supabase/getAccounts.ts
      - updateAccount: src/data/datasource/data/financial/accounts/supabase/updateAccount.ts
  categoriesDatasource (Supabase):
    path: src/data/datasource/data/financial/categories/supabase/
    methods:
      - createCategory: src/data/datasource/data/financial/categories/supabase/createCategory.ts
      - deleteCategory: src/data/datasource/data/financial/categories/supabase/deleteCategory.ts
      - getCategories: src/data/datasource/data/financial/categories/supabase/getCategories.ts
      - updateCategory: src/data/datasource/data/financial/categories/supabase/updateCategory.ts
  transactionsDatasource (Supabase):
    path: src/data/datasource/data/financial/transactions/supabase/
    methods:
      - createTransaction: src/data/datasource/data/financial/transactions/supabase/createTransaction.ts
      - deleteTransaction: src/data/datasource/data/financial/transactions/supabase/deleteTransaction.ts
      - getTransactions: src/data/datasource/data/financial/transactions/supabase/getTransactions.ts
      - updateTransaction: src/data/datasource/data/financial/transactions/supabase/updateTransaction.ts
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
