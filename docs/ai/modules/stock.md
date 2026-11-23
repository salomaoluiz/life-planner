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

## Spec 118: shopping lists (needs API 6.2.0)

- **Sections:** Stock is a section menu like Finances and Investments: `Stock/Layout` (`STOCK_SECTIONS` items `/stock`, lists `/stock/lists`, catalog `/stock/catalog`; `getStockSection` reads the path; `SectionHeader` = overline "Estoque" + section title, the title opens the shared `section_picker` below `expanded`). The tab route is now `stock` (a folder with `_layout.tsx` → `Stock/Layout`, a nested Stack: `index`, `lists/index`, `list/[id]`, `catalog`, `locations/[id]`); `NAVIGATION_ITEMS`, `VALID_BASES`, `useAppTabBarViewModel` (landing `/stock`) and `useSectionPickerViewModel` know it. "Categorias e locais" (`Stock/Catalog`) only opens the existing `stock_catalog` sheet.
- **Lists screen** (`Stock/Lists`): `useStockListsViewModel` reads every list (`getShoppingListsUseCase({ includeArchived: true })`, no owner = all readable owners), `ShoppingListsUIModel` gives the owner chips (Todas / Pessoal / each active family), the active cards (default badge, rows, automatic count, estimate and coverage, empty copy) and the archived block with "Reativar". testIds `stock.lists.*`.
- **List detail** (`Stock/ListDetail`): groups by top-level category ("Outros" last) with subtotals, rows with badge (Automático / Editado por você / Só texto), stock line, quantity, price + source, estimate and remove (×) with a 5 s undo (`POST rows` with `restore` and the previous `origin`); add field = `AutocompleteField` over `suggestStockItemsUseCase` of the list owner plus `+ Adicionar "<texto>" só como texto`; a row opens an edit sheet (`QuantityField`, `AmountInput`, description for text rows); archived family → read-only. testIds `stock.list-detail.*`. Swipe-to-remove is not built (the × button and the sheet's "Remover" cover it).
- **Modals:** `stock_shopping_list` (`ShoppingListModal`: new/edit, owner only at creation, default switch, archive, 409 → name taken) and `stock_add_to_list` (`AddToListModal`: item card, list picker of the item owner starting on `effectiveShoppingListId`, quantity = `restockQuantity` or 1, merge notice read from the chosen list). The item details sheet has "Adicionar à lista" (hidden for stock-only items) and the item form a "Lista de compras" picker (default list named, hidden for stock-only; `shoppingListId` in create/update, owner-change preview line).
- **Data:** `ShoppingListEntity.ts` (cards, detail, rows, summary), `ShoppingListModels` (`parse*`), `shoppingLists.ts` in the datasource api and the repository (no cache: React Query), use cases `get|create|update ShoppingList(s)`, `add|update|delete ShoppingListRow`, `getRestockSummary`. Items carry `shoppingListId`, `effectiveShoppingListId`, `estimatedUnitPriceCents`.
- **E2E:** `stock/shopping-list-smart-row` and `stock/shopping-list-empty` (tags `stock`, `spec-118`); `create-stock-item` takes `MIN_QUANTITY`/`IDEAL_QUANTITY`.

## Shopping mode and closing (spec 120)

- **Screens:** `Stock/Purchase` (route `stock/purchases/[id]`: totals, "A comprar" and "No carrinho", search/outside-the-list add, the "Marcar item" sheet inline, end/close/discard, offline banner), `Stock/PurchaseClose` (route `stock/purchase-close/[id]`: the 4-step wizard through `ClosingModel`: `breakdownOf`, `visibleSteps`), modal `stock_start_purchase` (`modals/StartPurchaseModal`: join an open purchase or start one with a market) and the strip + "Ir às compras" button on `ListDetail`; the Home banner is `Home/components/PendingPurchaseBanner`.
- **Data:** `PurchaseEntity.ts`, `PurchaseRepository` (merged into `StockRepository`/`StockDatasource`), `PurchaseModels.ts` parsers, `items/api/purchases.ts` (writes carry the `Idempotency-Key`), 16 use cases under `useCases/cases/stock/*Purchase*|*Market*|closing*`.
- **Offline:** `purchaseQueue` (`createOfflineQueue(StorageKeys.string.PURCHASE_OFFLINE_QUEUE)`, kinds `PURCHASE_ROW`, `PURCHASE_ROW_DELETE`, `PURCHASE_END`, `PURCHASE_DISCARD`; `ownerId` holds the purchase id, `itemId` the row id) with the overlay built by `buildPurchaseModel`; close and post-closing edits never queue. Events: `@infrastructure/sse` (`subscribeToEvents`, XHR stream with `Authorization` and `Last-Event-ID`, backoff reconnect, no polling).
- **Not built:** barcode scan ("Ler código") and item suggestions in the search, offline start of a purchase, the closed purchase screen (edit/delete UI; the use cases exist), merge UI, the per-market price chart in the sheet, the compact mobile variants of the artboards, the "Mercado padrão"/"Categoria no finance" pickers in the list form, new items with category/location choice in step 2 ("É este" or skip).

## Spec 121: barcode reader and AI suggestions (needs API 6.5.0)

- **Reader:** modal `stock_barcode` (`Stock/modals/StockBarcodeModal`, lazy: it is the only chunk that imports the camera): `useStockBarcodeViewModel` reads a code from the camera (`onScan`: UPC-E expanded by `expandUpcE`, a QR with the stock location link opens the location through `locationIdFromLink`, other QR content is "Código não reconhecido") or from the typed field (a USB reader types into it, Enter searches), cleans it (`cleanBarcode`), looks it up (`lookupStockBarcodeUseCase`, `GET /stock/barcodes/:code`) and: no match → `replaceModal("add_new_stock_item", { barcode })`, one match → the quick sheet, several → the owner picker (skipped when the `ownerId` param, the stock filter, is one of them). The sheet (`BarcodeResult`) moves the item through `useStockQuickMovement` (`onStep` + `commit`, `onOpen` for "Abri"), so the 117 notice with Desfazer, the expired-lot question and the offline queue all apply; archived families are read-only. Params: `ownerId`, `code` (look up on open). Wide = two columns (camera | field + result), Compact = full screen camera with a bottom panel (`views/Compact.tsx`).
- **Camera:** `@infrastructure/barcodeScanner` is the only importer of `expo-camera` (lint rule): `BarcodeScannerView` (native `CameraView` with the FR 5 symbologies; web: `getUserMedia` video + `BarcodeDetector` polling, `isWebScanSupported`), `useScannerPermission` (`granted|denied|loading|unavailable`) and `vibrateOnScan` (expo-haptics). Without camera support or permission the area explains it and the typed field keeps working. `app.config.ts` has the `expo-camera` plugin (permission text, no audio).
- **Entry points:** icon button in the Stock header (`stock.list.scan-button`, passes the filter owner), "Ler código" in the quick add (`quickAdd.scan`), the Home stock card (`home.stock-attention.scan`), and "Ler código com a câmera" under the barcode field of the item form (inline camera, then a duplicate lookup).
- **New item form:** `useItemSuggestions` (`POST /stock/item-suggestions` through `suggestStockItemUseCase`): with `barcode` it asks on open, with `ai=1` + `description` (quick add "Criar com IA") it asks for the name, "Preencher com IA" asks for the typed name (≥ 3 characters, disabled with "volta amanhã" when today's searches are over); only EMPTY fields are filled and each gets a badge ("Open Food Facts" / "IA", `SourceBadge`) that goes away when the user edits it; `SuggestionBanner` shows searching ("Preencher sozinho" ignores the answer), the suggestions notice, `AI_NOT_SURE`, `AI_UNAVAILABLE` or the limit; the package is a hint under the quantity (and fills the first lot of a kg/L item, a UNIT item from a code starts at 1); the usage line comes from the answer or from `getAiUsageUseCase` (read only once a name is typed). `useBarcodeField`: inline scan, duplicate lookup and the 409 `BARCODE_IN_USE` (`StockBarcodeInUse`) as "Este código já está em … / Abrir item" (opens the reader on that code). A name that matches an item without a code offers "Vincular código" (`updateStockItemUseCase`, then the reader opens that item).
- **Quick add:** empty search → "Criar com IA" / "Criar sem IA" and "Pesquisa completa · N de M restantes hoje" (`getAiUsageUseCase`, only while searching).
- **Data:** `StockBarcodeModels`, `StockBarcodeEntity`, datasource `stockBarcode.ts`, repository `stockBarcode.ts`, use cases `lookupStockBarcode`, `suggestStockItem`, `getAiUsage`; `stockApiError` maps 409 `BARCODE_IN_USE` and the invalid-code answers. `Stock` also reads the `item` param to open the details sheet ("Abrir detalhe").
- **Shopping mode:** the `Stock/Purchase` header has "Ler código" (`stock.purchase.scan`): the reader opens with `purchaseId` and a code calls `addPurchaseRowByCodeUseCase` (`POST /stock/purchases/:id/rows/by-code`: the item, a named row from Open Food Facts or a placeholder, marked "Sugerido"), then keeps scanning; online only (the row arrives through the SSE stream). `/stock/purchases/<id>` is a valid modal base (`modalPath`).
- **Not built:** the closing suggestion of category/location from the light AI call, the duplicate check on blur of the typed code (the 409 on save covers it), per-field badges inside the label (they sit above the field).
- **E2E:** `stock/barcode-quick-sheet` and `stock/barcode-new-item` (tags `stock`, `spec-121`; `create-stock-item` takes `BARCODE`).
