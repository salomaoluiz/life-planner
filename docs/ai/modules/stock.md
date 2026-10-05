# Stock Module Context

## Domain

```yaml
entities:
  StockEntity:
    path: src/domain/entities/stock/StockEntity.ts
    properties:
      - (Properties define the stock/inventory item structure)
  stockExpiration:
    path: src/domain/entities/stock/stockExpiration.ts
    description: Single source of truth for the 7-day expiration rule (calendar-day based, local time)
    exports:
      - CLOSE_TO_EXPIRATION_DAYS (7)
      - StockExpirationStatus (EXPIRED | EXPIRING | OK)
      - daysUntilExpiration(expirationDate, now)
      - getStockExpirationStatus(expirationDate, now)

interfaces:
  StockRepository:
    path: src/domain/repositories/stock/stockRepository.ts
    methods:
      - createStockItem
      - deleteStockItem
      - getStockItems
      - updateStockItem
```

## Application

```yaml
use_cases:
  createStockItemUseCase:
    path: src/application/useCases/cases/stock/createStockItemUseCase.ts
    behavior: Creates a new stock/inventory item.

  deleteStockItemUseCase:
    path: src/application/useCases/cases/stock/deleteStockItemUseCase.ts
    behavior: Deletes a stock item by ID.

  getStockItemsUseCase:
    path: src/application/useCases/cases/stock/getStockItemsUseCase.ts
    behavior: Retrieves all stock items for the user/family.

  updateStockItemUseCase:
    path: src/application/useCases/cases/stock/updateStockItemUseCase.ts
    behavior: Updates an existing stock item.

  getStockDashboardUseCase:
    path: src/application/useCases/cases/home/getStockDashboardUseCase.ts
    behavior: Retrieves dashboard overview for stocks.

dtos:
  - name: StockDTO
    path: src/application/dto/stock/StockDTO.ts
  - name: StockDashboardDTO
    path: src/application/dto/home/StockDashboardDTO.ts
```

## Infrastructure

```yaml
repositories:
  stockRepositoryImpl:
    path: src/data/repositories/repos/stock/stockRepositoryImpl.ts
    implements: StockRepository

datasources:
  stockDatasource (NestJS API, `@infrastructure/api`):
    path: src/data/datasource/data/storage/items/api/
    errors: src/data/datasource/data/storage/items/api/stockApiError.ts (session/connectivity re-thrown, everything else GenericError with ids-only context)
    methods:
      - createStockItem: POST /v1/stock/items
      - deleteStockItem: DELETE /v1/stock/items/:id
      - getStockItems: GET /v1/stock/items?ownerId=<id>
      - updateStockItem: PATCH /v1/stock/items/:id (only defined fields; owner and ownerId together)

models:
  StockModel:
    path: src/data/models/stock/StockModel.ts
    notes: API camelCase shape, also the cache shape (cache key CACHE_STOCK_DATA is versioned `_v2`); no status field
```

## Presentation

```yaml
screens:
  Stock:
    path: src/presentation/screens/Stock/index.tsx
  Home (Dashboard Overview):
    path: src/presentation/screens/Home/index.tsx

add_stock_item: quick-add tab button (`/quick_add`); the Stock screen has no add button.

containers:
  - name: StockCard
    path: src/presentation/screens/Stock/containers/StockCard/index.tsx
  - name: StockDashboard
    path: src/presentation/screens/Home/containers/StockDashboard/index.tsx

modals:
  - name: NewStockItemModal
    path: src/presentation/screens/Stock/modals/NewStockItemModal/index.tsx

view_models:
  - name: StockViewModel
    path: src/presentation/screens/Stock/models/StockViewModel.ts
  - name: NewStockItemViewModel
    path: src/presentation/screens/Stock/modals/NewStockItemModal/models/NewStockItemViewModel.ts
  - name: StockDashboardViewModel
    path: src/presentation/screens/Home/models/StockDashboardViewModel.ts
```
