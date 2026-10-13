# Stock Module Context

## Domain

```yaml
entities:
  StockEntity:
    path: src/domain/entities/stock/StockEntity.ts
    properties:
      - (Properties define the stock/inventory item structure)
      - createdAt (optional; also optional on StockDTO and StockModel)
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

dtos:
  - name: StockDTO
    path: src/application/dto/stock/StockDTO.ts
```

Home attention rule: `getStockAttentionUseCase` (see `home.md`); the Stock tab's own rule is spec 011.

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
  Stock (list):
    path: src/presentation/screens/Stock/index.tsx
    composition: Screen + FlashList (ScreenHeader, SearchField, ChipGroup filters, grouped rows with ListItem/IconTile/Badge); sort sheet; states Skeleton/ErrorState/EmptyState/no-results; route param `/stock?filter=EXPIRING|EXPIRED|ALL` preselects the filter; toolbar add button (testID stock-add)
  Home: see home.md

containers:
  - name: StockItemDetails
    path: src/presentation/screens/Stock/containers/StockItemDetails/index.tsx
    behavior: BottomSheet with the filled fields of one item; delete via ConfirmDialog (deleteStockItemUseCase)

modals:
  - name: NewStockItemModal
    path: src/presentation/screens/Stock/modals/NewStockItemModal/index.tsx
    behavior: BottomSheet route `/stock/add_new_stock_item` (optional `ownerId` param preselects the owner); "More details" collapsed; quantity is digits-only (number-pad, >= 1); discard confirm when dirty

view_models:
  - useStockViewModel: src/presentation/screens/Stock/hooks/useStockViewModel.ts (query, 200 ms search debounce, filter/sort state, route param, sheets)
  - useStockItemDetailsViewModel: src/presentation/screens/Stock/containers/StockItemDetails/hooks/useStockItemDetailsViewModel.ts
  - useNewStockItemViewModel: src/presentation/screens/Stock/modals/NewStockItemModal/hooks/useNewStockItemViewModel.ts (+ useForm.ts: validateStockForm, buildStockParams)

ui_models:
  - StockItemUIModel: src/presentation/screens/Stock/models/StockItemUIModel.ts (status, badge, icon tile, date info, detail rows)
  - StockListUIModel: src/presentation/screens/Stock/models/StockListUIModel.ts (search, filter, sort, grouping "Needs attention"/"OK", counts; Expiring filter includes expired items)
  - NewStockItemUIModel: src/presentation/screens/Stock/modals/NewStockItemModal/models/NewStockItemUIModel.ts

notes: no edit flow (spec 011 out of scope); i18n namespace `stock` (units shown via common.units.*)
```
