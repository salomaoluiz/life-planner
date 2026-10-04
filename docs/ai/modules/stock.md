# Stock Module Context

## Domain

```yaml
entities:
  StockEntity:
    path: src/domain/entities/stock/StockEntity.ts
    properties:
      - (Properties define the stock/inventory item structure)

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
  storageItemsDatasource (Supabase):
    path: src/data/datasource/data/storage/items/supabase/
    methods:
      - createStockItem: src/data/datasource/data/storage/items/supabase/createStockItem.ts
      - deleteStockItem: src/data/datasource/data/storage/items/supabase/deleteStockItem.ts
      - getStockItems: src/data/datasource/data/storage/items/supabase/getStockItems.ts
      - updateStockItem: src/data/datasource/data/storage/items/supabase/updateStockItem.ts
```

## Presentation

```yaml
screens:
  Stock:
    path: src/presentation/screens/Stock/index.tsx
  Home (Dashboard Overview):
    path: src/presentation/screens/Home/index.tsx

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
