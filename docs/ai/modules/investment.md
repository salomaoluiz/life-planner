# Investment Module Context (spec 102)

> Born on the NestJS API (no Supabase). Screens and modals render through `AdaptiveLayout` (spec 099): each folder has an `index.tsx` entry (calls the ViewModel once) and `views/Wide.tsx` (the View, which reads `useDensity()` for the compact cards). Money is integer cents in the asset currency; quantities and unit prices are decimal strings (up to 8 places), handled with `@utils/decimal` (scaled `bigint`), never floats.

## Domain

```yaml
entities:
  InvestmentEntities:
    path: src/domain/entities/investment/InvestmentEntities.ts
    notes: plain interfaces (InvestmentAsset, InvestmentAssetDetail, InvestmentOperation, InvestmentFee, InvestmentPosition, InvestmentValuation, *Result)
  enums:
    path: src/domain/entities/investment/enums.ts
    notes: InvestmentAssetClass, AssetStatus, FeeKind, OperationType, ValuationSource, ASSET_CLASS_ORDER, TICKER_REQUIRED_CLASSES, MAX_FEES_PER_OPERATION
  position:
    path: src/domain/entities/investment/position.ts
    notes: port of the API's PositionCalculator for the form preview (computeTotals, previewOperation); the API result is the source of truth after saving

errors: src/domain/entities/errors/investment/ (TickerExists, InvestmentArchived, InvestmentClassLocked, InvestmentFeesAboveSale, InvestmentNegativePosition(date), InvestmentAccountNotChangeable, InvestmentRowUseOperation)

interfaces:
  InvestmentRepository:
    path: src/domain/repositories/investment/investmentRepository.ts
    methods:
      [
        createAsset,
        createOperation,
        deleteAsset,
        deleteOperation,
        deleteValuation,
        getAsset,
        getAssets,
        getOperationLink,
        updateAsset,
        updateOperation,
        upsertValuation,
      ]
```

## Application

```yaml
use_cases: src/application/useCases/cases/investment/*UseCase.ts (createInvestmentAsset, createInvestmentOperation, deleteInvestmentAsset, deleteInvestmentOperation, deleteInvestmentValuation, getInvestmentAsset, getInvestmentAssets, getInvestmentOperationLink, updateInvestmentAsset, updateInvestmentOperation, upsertInvestmentValuation) — pass-through with addContext; they return domain entities (no DTO layer)
query_keys: src/application/queryKeys/investmentKeys.ts (investment, investment/assets/<status>, investment/asset/<id>)
```

## Infrastructure

```yaml
repository: src/data/repositories/repos/investment/investmentRepositoryImpl.ts (no cache: React Query caches the reads)
datasource (NestJS API): src/data/datasource/data/investment/api/index.ts
  errors: investmentApiError.ts (409 ticker, 422 messages -> domain errors, negative-position date parsed from the message, 403 "account you can't change")
  endpoints: GET/POST /v1/investments/assets, GET/PATCH/DELETE /v1/investments/assets/:id, POST /v1/investments/assets/:id/operations, PATCH/DELETE /v1/investments/operations/:id, PUT /v1/investments/assets/:id/valuations/:date, DELETE /v1/investments/valuations/:id, GET /v1/finance/transactions/:id (getOperationLink reads `investment`)
  validation: quantities/prices are normalized ("10,5" -> "10.5") and must be > 0 BEFORE the call (FieldInvalid)
model: src/data/models/investment/InvestmentModel.ts (API shape, no toJSON)
```

## Presentation

```yaml
routes: app/(app)/(tabs)/investments/{_layout,index,[id]}.tsx (tab "investments" after Finances; the Stack lives in Investment/Layout)
screens:
  List: src/presentation/screens/Investment/List (owner chips via the finance owner filter, All/Archived SegmentedControl with counts, search by ticker/name, rows grouped by class AND currency with "Cost · Current" subtotal, table row on regular width, card on compact, footnote; states skeleton/error/empty/no results; archived family = read-only)
  Detail: src/presentation/screens/Investment/Detail (6 summary cards, operations list -> operation modal, value history with delete, "More actions" sheet: edit / archive-reactivate / delete with a ConfirmDialog that lists operations and finance entries, archived banner with Reactivate; `?operation=<id>` opens that operation once)
modals (MODAL_ROUTES names):
  investment_asset: Modals/AssetModal (class SelectField, ticker upper-cased and filling the name, owner chips, currency (USD suggested for foreign stock, locked after the first operation), optional first value)
  investment_operation: Modals/OperationModal (Buy/Sell, date, quantity, price, up to 10 fees (kind, amount, description for Other), summary, "Generate finance entry" switch + account SelectField (active, asset currency, writable owner, BROKERAGE first), preview: new average price / realized result; sell above the held quantity blocks saving; read-only when the linked account is not reachable)
  investment_valuation: Modals/ValuationModal (date + value per unit, "Position: q x price = value")
helpers: Investment/models/{assetList,format}.ts, Investment/utils/investmentErrorMessage.ts, Investment/hooks/invalidateInvestments.ts (invalidates investment queries AND finance data)
testIds: src/presentation/screens/Investment/testIds.ts (investment.list.*, investment.detail.*, investment.asset-modal.*, investment.operation-modal.*, investment.valuation-modal.*)
finance_integration: Financial/Transactions rows of INVESTMENT_CONTRIBUTION / INVESTMENT_REDEMPTION ("Compra ITSA4", category translated from the key, "outside totals" caption) open the operation (`onInvestmentPress` -> getInvestmentOperationLinkUseCase -> /investments/<assetId>?operation=<id>); they are never edited as transactions
```

## Design deviations (spec 102)

- One View per screen that adapts through `useDensity()`; the artboard's mobile "fees collapsed into one line with Edit" is not built: the fee list stays expanded on compact.
- The fee breakdown panel of the detail artboard is not a separate panel: tapping an operation opens the operation modal, which lists its fees.
- The archive banner and the list use the app's own components (SegmentedControl for the Assets/Archived tabs).
