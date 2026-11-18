# Stock Module Context

> Screens and modals render through `AdaptiveLayout` (spec 100): each folder has an `index.tsx` entry (calls the ViewModel once) and `views/Wide.tsx` (the View). View paths below point to `views/Wide.tsx`.

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
    path: src/presentation/screens/Stock/views/Wide.tsx
    composition: Screen + FlashList (ScreenHeader, SearchField, ChipGroup filters, grouped rows with ListItem/IconTile/Badge); sort sheet; states Skeleton/ErrorState/EmptyState/no-results; route param `/stock?filter=EXPIRING|EXPIRED|ALL` preselects the filter; toolbar add button; testIDs in `Stock/testIds.ts` (`stock.list.*`), form ids in `NewStockItemModal/testIds.ts` (`stock.item-form.*`), details ids in `StockItemDetails/testIds.ts` (`stock.item-details.*`)
  Home: see home.md

containers:
  - name: StockItemDetails
    path: src/presentation/screens/Stock/containers/StockItemDetails/index.tsx
    behavior: BottomSheet with the filled fields of one item; delete via ConfirmDialog (deleteStockItemUseCase)

modals:
  - name: NewStockItemModal
    path: src/presentation/screens/Stock/modals/NewStockItemModal/views/Wide.tsx
    behavior: BottomSheet modal `add_new_stock_item` (URL `/stock/add_new_stock_item` from Stock) (optional `ownerId` param preselects the owner); "More details" collapsed; quantity is digits-only (number-pad, >= 1); discard confirm when dirty

view_models:
  - useStockViewModel: src/presentation/screens/Stock/hooks/useStockViewModel.ts (query, 200 ms search debounce, filter/sort state, route param, sheets)
  - useStockItemDetailsViewModel: src/presentation/screens/Stock/containers/StockItemDetails/hooks/useStockItemDetailsViewModel.ts
  - useNewStockItemViewModel: src/presentation/screens/Stock/modals/NewStockItemModal/hooks/useNewStockItemViewModel.ts (+ useForm.ts: validateStockForm, buildStockParams)

ui_models:
  - StockItemUIModel: src/presentation/screens/Stock/models/StockItemUIModel.ts (status, badge, icon tile, date info, detail rows)
  - StockListUIModel: src/presentation/screens/Stock/models/StockListUIModel.ts (search, filter, sort, grouping "Needs attention"/"OK", counts; Expiring filter includes expired items)
  - NewStockItemUIModel: src/presentation/screens/Stock/modals/NewStockItemModal/models/NewStockItemUIModel.ts

notes: E2E flows in `e2e/flows/stock/` (spec 021) and `e2e/flows/family/family-stock-item.yaml` (spec 022; owner chips `stock.item-form.owner-<ownerId>`, filter chips `stock.list.filter-<ownerId|PERSONAL>`); status badges expose `stock.list.status-expired|expiring`, there is no out-of-stock status; no edit flow (spec 011 out of scope); i18n namespace `stock` (units shown via common.units.*)
```

## Responsive modal layout (spec 037)

`NewStockItemModal` is a `BottomSheet size="form"` with `FormColumns`: main fields left, the "More details" toggle and fields right. `useNewStockItemViewModel` opens `isMoreOpen` by default on `medium`/`expanded` (read once on mount). `StockItemDetails` and Quick add stay `dialog`.

## Archived families (spec 042)

`StockListUIModel` keeps the archived families' items out of All, Personal, Expiring / Expired, the counters and the Home attention count; the owner chip of an archived family is listed last with the archive marker and shows its items read-only (`vm.readOnly`: no add button, `stock.list.readonly-banner`, tapping a row shows `stock.list.readonly-toast` instead of the details sheet). The new-item form only offers active owners.

## Spec 116: lots, movements, categories, locations

- **Contract (breaking, API 6.0.0):** items carry `lots` only in the detail; the list is lean (`quantity`, `nearestExpiration`, `expirationStatus`, `hasOpenLot`, `needsRestock`, `category`, `location`). Units `unit|kilogram|liter`; days are `YYYY-MM-DD` read/written in local time by `@domain/entities/stock/stockDay`. Cache key `CACHE_STOCK_DATA` is `_v3` (list only, never the detail).
- **Domain:** `StockEntity` (+ `StockLotEntity`, `StockMovementEntity`, `StockCatalogEntity`), pure `stockQuantity` (display g/ml below 1, adaptive input `applyInput`/`toQuantity`), `stockDay`; `stockExpiration.ts` was removed (the API sends the status). Errors `StockNotEnoughQuantity`, `StockLotAlreadyOpen`, `StockCategoryInUse`, `StockLocationInUse` (mapped in `stockApiError`).
- **Data/application:** datasource files `getStockItem`, `stockMovements`, `stockCatalog`; repository `stockMovements`, `stockCatalog`, `toStockEntity`; use cases `getStockItem`, `createStockMovement`, `getStockMovements`, `getOwnerChangePreview`, `suggestStockItems`, `get|create|update|deleteStockCategory`, `createStockCategorySuggestions` and the same for locations. Home attention also lists `RESTOCK` items.
- **Presentation:** list with Repor/Vencendo/Vencido/Aberto badges and Categoria/Local filters (descendants expanded client side from `fetchCatalog`); `StockItemDetails` (tiles, lots, history with "Carregar mais", actions); `NewStockItemModal` (create + edit with `itemId`, owner-change preview, name suggestion hint, `QuantityField`); modal `stock_movement` (`StockMovementModal`: entry/consume/open/discard/adjust) and modal `stock_catalog` (`StockCatalogModal`: tree + locations). testIds `stock.item-form.*`, `stock.movement.*`, `stock.catalog.*`, `stock.item-details.*`.

## Spec 117: quick movement (needs API 6.1.0)

- **Row:** `StockQuickRow` (list, quick add, location route) = `ListItem` + `StockQuickStepper` (− quantity +, "Abri" chip when `StockItemUIModel.canOpen`, "pending" icon while queued, quantity only for archived families via `isReadOnly`); badges sit under the subtitle. Buttons are 44 px `IconButton`s with `onLongPress` (400 ms, `LONG_PRESS_MS`) and web `onContextMenu` for the exact quantity sheet.
- **Engine:** `useStockQuickMovement({ onSettled })` (one per screen): pure `domain/entities/stock/quickGesture` (`tap`, `toRequest`, `STOCK_GESTURE_IDLE_MS` 2000) merges taps per item and direction, optimistic quantity (`displayQuantity` = server + queued deltas + gesture in flight), notice (`stock.notice`, 6 s, Desfazer / Validade) built on `Toast` with a second action, expired-lot question (`ExpiredLotPrompt`, loads the lots through `getStockItemUseCase`), `ExactSheet`, `onOpen` ("Abri", OPEN 1), undo (`undoStockGestureUseCase`) and expiry change (`setStockGestureExpirationUseCase`). `StockQuickOverlays` renders notice + sheets, `OfflineBanner` the "Sem conexão · N movimentos" bar.
- **Offline:** `@infrastructure/offlineQueue` (persistent FIFO in MMKV through `asyncStorage`, `useOfflineQueue`), entries `{ clientId, kind MOVEMENT|UNDO|EXPIRATION, itemId, ownerId, payload with signed delta }`; `clientId` is the `Idempotency-Key`. Connectivity is detected from `ConnectivityError` (no NetInfo dependency); `classifyFailure` keeps the entry on connectivity/5xx and drops 404/409/422 with a notice ("N movimento não entrou: …"). Flush on mount, app foreground and every 15 s while something waits.
- **Quick add:** `QuickAdd` has a search (`SEARCH_MIN_CHARS` 2, 300 ms), the 5 most moved items of 30 days (`getFrequentStockItemsUseCase`, not owner-scoped so it loads in parallel with the owners) and the same rows; "Nada encontrado" opens `add_new_stock_item?description=`.
- **Location QR:** card in the catalog (`LocationQrSheet`: `@infrastructure/qrcode` matrix drawn by the `QrCode` component, `@infrastructure/share`, `@infrastructure/print` over `expo-print` / hidden iframe, A6 page from `domain/entities/stock/locationQrPrint`); link = `EXPO_PUBLIC_PROJECT_WEBSITE_URL` + `/stock/locations/<id>` (`locationLink`). Route `app/(app)/(tabs)/stock/locations/[id].tsx` renders `Stock` with the `id` param: `useStockViewModel` filters by it, loads `getStockLocationUseCase` for the title, 404 → `stock.location.not-found`, archived → `stock.location.archived-banner`.
- **Item form:** "Passo do − / +" (`quickStep`, `stock.item-form.step-input`) under "Mais opções".
