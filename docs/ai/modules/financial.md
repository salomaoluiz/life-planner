# Financial Module Context

## Domain

```yaml
entities:
  CategoryEntity:
    path: src/domain/entities/financial/CategoryEntity.ts
    properties:
      - (Properties define the financial category structure)
  TransactionEntity:
    path: src/domain/entities/financial/TransactionEntity.ts
    properties:
      - (Properties define the financial transaction structure)

interfaces:
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
  - name: CategoryDTO
    path: src/application/dto/financial/CategoryDTO.ts
  - name: TransactionDTO
    path: src/application/dto/financial/TransactionDTO.ts
```

## Infrastructure

```yaml
repositories:
  categoryRepositoryImpl:
    path: src/data/repositories/repos/financial/categories/categoryRepositoryImpl.ts
    implements: CategoryRepository
  transactionRepositoryImpl:
    path: src/data/repositories/repos/financial/transactions/transactionRepositoryImpl.ts
    implements: TransactionRepository

datasources:
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

containers:
  - name: ListHeader
    path: src/presentation/screens/Financial/Transactions/containers/ListHeader/index.tsx
  - name: ListItem
    path: src/presentation/screens/Financial/Transactions/containers/ListItem/index.tsx
  - name: RefetchCache
    path: src/presentation/screens/Financial/Transactions/containers/RefetchCache/index.tsx
  - name: ItemSeparator
    path: src/presentation/screens/Financial/Transactions/containers/ItemSeparator/index.tsx

modals:
  - name: NewTransactionModal
    path: src/presentation/screens/Financial/Transactions/modals/NewTransactionModal/index.tsx

view_models:
  - name: FinancialTransactionViewModel
    path: src/presentation/screens/Financial/Transactions/models/FinancialTransactionViewModel.ts
  - name: NewTransactionViewModel
    path: src/presentation/screens/Financial/Transactions/modals/NewTransactionModal/models/NewTransactionViewModel.ts
```
